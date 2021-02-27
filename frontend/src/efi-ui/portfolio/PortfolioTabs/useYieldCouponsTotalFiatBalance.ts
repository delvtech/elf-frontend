import { Money } from "ts-money";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { YC } from "elf-contracts/types";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { getQueriesData } from "efi-ui/base/queryResults";
import zip from "lodash.zip";
import { formatUnits } from "ethers/lib/utils";
import { useMarketsForTokens } from "efi-ui/markets/useMarketsForTokens";
import { useMarketSpotPrices } from "efi-ui/markets/useMarketSpotPrices";
import { useMarketPairedTokens } from "efi-ui/markets/useMarketPairedTokens";
import { getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrices } from "efi-ui/coingecko/useCoinGeckoPrices";

export function useYieldCouponsTotalFiatBalance(
  account: string | null | undefined,
  yieldCoupons: YC[]
): Money {
  const { currency } = useCurrencyPref();
  const ycBalanceOfResults = useSmartContractReadCalls(
    yieldCoupons,
    "balanceOf",
    {
      enabled: !!account,
      callArgs: [account as string],
    }
  );
  const ycDecimalResults = useSmartContractReadCalls(yieldCoupons, "decimals");

  // YCs should be paired against a token we can lookup in Coingecko for fiat price
  const markets = useMarketsForTokens(yieldCoupons);
  const pairedTokens = useMarketPairedTokens(markets, yieldCoupons);
  const pairedTokenSymbolResults = useSmartContractReadCalls(
    pairedTokens,
    "symbol"
  );
  const pairedTokenDecimalResults = useSmartContractReadCalls(
    pairedTokens,
    "decimals"
  );

  // The price of 1 paired token in Fiat, eg: $1,400.23 if token is Weth
  const pairedTokenCoinGeckoPriceResults = useCoinGeckoPrices(
    getQueriesData(pairedTokenSymbolResults).map((tokenSymbol) =>
      getCoinGeckoId(tokenSymbol)
    ),
    currency
  );

  // The price of the YC in its base asset, eg: Weth
  const spotPriceResults = useMarketSpotPrices(markets, yieldCoupons);
  const ycPrices: string[] = zip(
    getQueriesData(spotPriceResults),
    getQueriesData(pairedTokenDecimalResults)
  ).map(([spotPrice, decimals]) => formatUnits(spotPrice || 0, decimals || 0));

  // the formatted quantity of YCs, eg: "42.2028211"
  const ycBalances: string[] = zip(
    getQueriesData(ycBalanceOfResults),
    getQueriesData(ycDecimalResults)
  ).map(([balanceOf, decimals]) => formatUnits(balanceOf || 0, decimals || 0));

  const fiatBalances = zip(
    ycPrices,
    ycBalances,
    getQueriesData(pairedTokenCoinGeckoPriceResults)
  ).map(([price, balance, coinGeckoPrice]) => {
    const ycBalance = +(balance || 0) * +(price || 0);
    return coinGeckoPrice?.multiply(+ycBalance);
  });

  const totalBalance = fiatBalances
    .filter((balance): balance is Money => !!balance)
    .reduce((sum, balance) => balance.add(sum), new Money(0, currency));

  return totalBalance;
}
