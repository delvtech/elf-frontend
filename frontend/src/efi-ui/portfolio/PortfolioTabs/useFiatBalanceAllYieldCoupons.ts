import { YC } from "elf-contracts/types/YC";
import { formatUnits } from "ethers/lib/utils";
import zip from "lodash.zip";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useCoinGeckoPrices } from "efi-ui/coingecko/useCoinGeckoPrices";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useOnSwapGivenInMulti } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenInMulti";
import { usePoolForTokenMulti } from "efi-ui/pools/usePoolForToken/usePoolForTokenMulti";
import { usePoolPairedTokenMulti } from "efi-ui/pools/usePoolPairedToken/usePoolPairedTokenMulti";

export function useFiatBalanceAllYieldCoupons(
  account: string | null | undefined,
  yieldCoupons: YC[],
  currency: Currency
): Money {
  // YCs should be paired against a token we can lookup in Coingecko for fiat price
  const markets = usePoolForTokenMulti(yieldCoupons);
  const baseAssetTokens = usePoolPairedTokenMulti(markets, yieldCoupons);
  const baseAssetTokenSymbolResults = useSmartContractReadCalls(
    baseAssetTokens,
    "symbol"
  );
  const baseAssetCoinGeckoIds = getQueriesData(
    baseAssetTokenSymbolResults
  ).map((tokenSymbol) => getCoinGeckoId(tokenSymbol));
  // The price of 1 paired token in Fiat, eg: $1,400.23 if token is Weth
  const baseAssetCoinGeckoPriceResults = useCoinGeckoPrices(
    baseAssetCoinGeckoIds,
    currency
  );

  // Get the user's balance of all the yield coupons
  const ycBalanceOfResults = useSmartContractReadCalls(
    yieldCoupons,
    "balanceOf",
    {
      enabled: !!account,
      callArgs: [account as string],
    }
  );

  // Total value in base asset of each yield coupon
  const totalValueInBaseAssetResults = useOnSwapGivenInMulti(
    account,
    markets,
    yieldCoupons,
    getQueriesData(ycBalanceOfResults)
  );

  const baseAssetDecimalsResult = useSmartContractReadCalls(
    baseAssetTokens,
    "decimals"
  );

  const balances: (Money | undefined)[] = zip(
    getQueriesData(baseAssetCoinGeckoPriceResults),
    getQueriesData(totalValueInBaseAssetResults),
    getQueriesData(baseAssetDecimalsResult)
  ).map(([price, balanceOf, decimals]): Money | undefined => {
    const formattedBalance = +formatUnits(+(balanceOf || 0), decimals);
    return price?.multiply(formattedBalance);
  });

  const totalBalance = balances
    .filter((balance): balance is Money => !!balance)
    .reduce((sum, balance) => balance.add(sum), new Money(0, currency));

  return totalBalance;
}
