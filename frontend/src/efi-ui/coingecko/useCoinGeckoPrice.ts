import { useQuery } from "react-query";

import { fetchCoinGeckoPrice } from "efi-coingecko";

export function useCoinGeckoPrice(
  coinGeckoId: string | undefined,
  currencyDenomination = "usd"
) {
  return useQuery<number>({
    queryKey: makeCoinGeckoPriceQueryKey(coinGeckoId, currencyDenomination),
    queryFn: async () => {
      const price = await fetchCoinGeckoPrice(
        coinGeckoId as string, // safe to cast because queryFn is only called when config.enabled is true
        currencyDenomination.toLowerCase()
      );
      return price;
    },
    enabled: !!coinGeckoId,
  });
}

interface CoinGeckoPriceVariables {
  coinGeckoId: string | undefined;
  currencyDenomination: string;
}

function makeCoinGeckoPriceQueryKey(
  coinGeckoId: string | undefined,
  currencyDenomination: string
): [string[], CoinGeckoPriceVariables] {
  return [
    ["coingecko", "/simple/price"],
    { coinGeckoId, currencyDenomination },
  ];
}
