import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";
import zip from "lodash.zip";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwapMulti } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwapMulti";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useCoinGeckoPrices } from "efi-ui/coingecko/useCoinGeckoPrices";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useCryptoDecimalsMulti } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimalsMulti";
import { useCryptoSymbolMulti } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbolMulti";
import { usePoolForTokenMulti } from "efi-ui/pools/usePoolForToken/usePoolForTokenMulti";
import { useTranchesWithBalance } from "efi-ui/portfolio/hooks/useTranchesWithBalance";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { useBaseAssetsForTranches } from "efi-ui/tranche/useBaseAssetsForTranches";

export function useFiatBalanceAllPrincipalTokens(
  library: Web3Provider | undefined,
  account: string | null | undefined
): Money {
  const { currency } = useCurrencyPref();

  // Get the tranches we're going to sum over
  const tranchesWithBalance = useTranchesWithBalance(account);
  const tranches = tranchesWithBalance.map(({ tranche }) => tranche);
  const balanceOfs = tranchesWithBalance.map(({ balanceOf }) => balanceOf);

  // See how much base asset we get if we dump all the user's tranche tokens
  // into their respective pools
  const pools = usePoolForTokenMulti((tranches as unknown) as ERC20Shim[]);
  const baseAssets = useBaseAssetsForTranches(tranches);
  const baseAssetBalancerAddresses = baseAssets.map((baseAsset) =>
    getTokenAddressForBalancer(baseAsset)
  );
  const trancheAddresses = tranches.map((tranche) => tranche?.address);
  const queryBatchSwapResults = useQueryBatchSwapMulti(
    SwapKind.GIVEN_IN,
    pools,
    trancheAddresses,
    baseAssetBalancerAddresses,
    balanceOfs
  );
  const parsedBatchSwapResults = zip(
    trancheAddresses,
    baseAssetBalancerAddresses,
    getQueriesData(queryBatchSwapResults)
  ).map(([tokenInAddress, tokenOutAddress, batchSwaps]) => {
    return parseQueryBatchSwapResult(
      tokenInAddress,
      tokenOutAddress,
      batchSwaps
    );
  });
  const amountOutForTrancheBalance = parsedBatchSwapResults.map(
    ({ tokenOut }) => tokenOut
  );

  // Get the total fiat value for how much base asset they'd get per tranche.
  const baseAssetSymbols = useCryptoSymbolMulti(baseAssets);
  const coinGeckoIds = baseAssetSymbols.map((baseAssetSymbol) =>
    getCoinGeckoId(baseAssetSymbol)
  );
  const baseAssetDecimals = useCryptoDecimalsMulti(baseAssets);
  const priceResults = useCoinGeckoPrices(coinGeckoIds, currency);
  const baseAssetCoinGeckoPrices = getQueriesData(priceResults);
  const trancheFiatBalances = zip(
    amountOutForTrancheBalance,
    baseAssetCoinGeckoPrices,
    baseAssetDecimals
  ).map(([valueInBaseAsset, baseAssetCoinGeckoPrice, decimals]) => {
    if (baseAssetCoinGeckoPrice && valueInBaseAsset) {
      const trancheFiatBalance = baseAssetCoinGeckoPrice.multiply(
        +formatUnits(valueInBaseAsset.abs(), decimals)
      );
      return trancheFiatBalance;
    }
    return undefined;
  });

  // Add up all the fiat balances together to produce the final sum
  const totalFiatBalance = calculateTotalFiatBalance(
    trancheFiatBalances,
    currency
  );

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
