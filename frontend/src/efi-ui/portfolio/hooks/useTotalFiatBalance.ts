import { Web3Provider } from "@ethersproject/providers";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import { formatUnits } from "ethers/lib/utils";
import zip from "lodash.zip";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwapMulti } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwapMulti";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useCoinGeckoPriceMulti } from "efi-ui/coingecko/useCoinGeckoPrices";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { useCryptoDecimalsMulti } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimalsMulti";
import { useCryptoSymbolMulti } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbolMulti";
import { useBaseAssetForPools } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPoolMulti";
import { usePoolForTokenMulti } from "efi-ui/pools/usePoolForToken/usePoolForTokenMulti";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";

export function useTotalFiatBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  trancheOrYieldToken: (Tranche | undefined)[] | (InterestToken | undefined)[]
): Money {
  const { currency } = useCurrencyPref();

  // Get the balances we're going to sum over
  const tokensWithBalanceResults = useTokensWithBalance(
    account,
    trancheOrYieldToken as ERC20Shim[]
  );
  const tokensWithBalance = tokensWithBalanceResults.map(({ token }) => token);
  const balanceOfs = tokensWithBalanceResults.map(({ balanceOf }) => balanceOf);

  // See how much base asset we get for each token if we dump into their
  // respective pools
  const pools = usePoolForTokenMulti(tokensWithBalance);
  const baseAssets = useBaseAssetForPools(pools);
  const baseAssetBalancerAddresses = baseAssets.map((baseAsset) =>
    getTokenAddressForBalancer(baseAsset)
  );
  const trancheOrYieldTokenAddresses = tokensWithBalance.map(
    (trancheOrYieldToken) => trancheOrYieldToken?.address
  );
  const queryBatchSwapResults = useQueryBatchSwapMulti(
    SwapKind.GIVEN_IN,
    pools,
    trancheOrYieldTokenAddresses,
    baseAssetBalancerAddresses,
    balanceOfs
  );
  const parsedBatchSwapResults = zip(
    trancheOrYieldTokenAddresses,
    baseAssetBalancerAddresses,
    getQueriesData(queryBatchSwapResults)
  ).map(([tokenInAddress, tokenOutAddress, batchSwaps]) => {
    return parseQueryBatchSwapResult(
      tokenInAddress,
      tokenOutAddress,
      batchSwaps
    );
  });
  const amountOutForTrancheOrYieldTokenBalance = parsedBatchSwapResults.map(
    ({ tokenOut }) => tokenOut
  );

  // Get the total fiat value for how much base asset they'd get per tranche.
  const baseAssetSymbols = useCryptoSymbolMulti(baseAssets);
  const coinGeckoIds = baseAssetSymbols.map((baseAssetSymbol) =>
    getCoinGeckoId(baseAssetSymbol)
  );
  const baseAssetDecimals = useCryptoDecimalsMulti(baseAssets);
  const priceResults = useCoinGeckoPriceMulti(coinGeckoIds, currency);
  const baseAssetCoinGeckoPrices = getQueriesData(priceResults);
  const fiatBalances = zip(
    amountOutForTrancheOrYieldTokenBalance,
    baseAssetCoinGeckoPrices,
    baseAssetDecimals
  ).map(([valueInBaseAsset, baseAssetCoinGeckoPrice, decimals]) => {
    if (baseAssetCoinGeckoPrice && valueInBaseAsset) {
      const fiatBalance = baseAssetCoinGeckoPrice.multiply(
        +formatUnits(valueInBaseAsset.abs(), decimals)
      );
      return fiatBalance;
    }
    return undefined;
  });

  // Add up all the fiat balances together to produce the final sum
  const totalFiatBalance = calculateTotalFiatBalance(fiatBalances, currency);

  return totalFiatBalance ?? new Money(0, currency);
}

function calculateTotalFiatBalance(
  fiatBalances: (Money | undefined)[],
  currency: Currency
): Money | undefined {
  const tranchesWithBalance: Money[] = fiatBalances.filter(
    (balance): balance is Money => {
      return balance !== undefined;
    }
  );

  if (!tranchesWithBalance.length) {
    return undefined;
  }

  const totalFiatBalance = tranchesWithBalance.reduce((balance, total) => {
    return total.add(balance);
  }, Money.fromDecimal(0, currency));

  return totalFiatBalance;
}
