import { QueryObserverResult, useQueries } from "react-query";

import { Currencies, Currency, Money } from "ts-money";

import { fetchCoinGeckoPrice } from "efi-coingecko";

export function useCoinGeckoPriceMulti(
  coinGeckoIds: (string | undefined)[],
  currency = Currencies.USD
): QueryObserverResult<Money>[] {
  const queries = coinGeckoIds.map((coinGeckoId) => {
    return {
      queryKey: makeCoinGeckoPriceQueryKey(coinGeckoId, currency),
      queryFn: async () => {
        const price = await fetchCoinGeckoPrice(
          coinGeckoId as string, // safe to cast because queryFn is only called when config.enabled is true
          currency
        );
        return price;
      },
      enabled: !!coinGeckoId,
    };
  });
  return useQueries(queries) as QueryObserverResult<Money>[];
}

interface CoinGeckoPriceVariables {
  coinGeckoId: string | undefined;
  currencyCode: string;
}

function makeCoinGeckoPriceQueryKey(
  coinGeckoId: string | undefined,
  currency: Currency
): [string[], CoinGeckoPriceVariables] {
  return [
    ["coingecko", "/simple/price"],
    { coinGeckoId, currencyCode: currency.code },
  ];
}
