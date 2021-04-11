import { QueryObserverResult, useQuery } from "react-query";

import { Currencies, Currency, Money } from "ts-money";

import { fetchCoinGeckoHistoricalPrice } from "efi-coingecko";

export function useCoinGeckoHistoricalPrice(
  coinGeckoId: string | undefined,
  currency = Currencies.USD,
  daysAgo: number
): QueryObserverResult<Money> {
  return useQuery<Money>({
    queryKey: makeCoinGeckoHistoricalPriceQueryKey(
      coinGeckoId,
      currency,
      daysAgo
    ),
    queryFn: async () => {
      const price = await fetchCoinGeckoHistoricalPrice(
        coinGeckoId as string, // safe to cast because queryFn is only called when config.enabled is true
        currency,
        daysAgo
      );
      return price;
    },
    enabled: !!coinGeckoId,
  });
}

interface CoinGeckoHistoricalPriceVariables {
  coinGeckoId: string | undefined;
  currencyCode: string;
  daysAgo: number;
}

function makeCoinGeckoHistoricalPriceQueryKey(
  coinGeckoId: string | undefined,
  currency: Currency,
  daysAgo: number
): [string[], CoinGeckoHistoricalPriceVariables] {
  return [
    ["coingecko", "/coins/"],
    { coinGeckoId, currencyCode: currency.code, daysAgo },
  ];
}
