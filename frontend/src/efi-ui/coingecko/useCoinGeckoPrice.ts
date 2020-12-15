import { fetchCoinGeckoPrice } from "efi-coingecko";
import { useQuery } from "react-query";

export function useCoinGeckoPrice(
  coinGeckoId: string | undefined,
  currencyDenomination = "usd"
) {
  return useQuery<number>({
    queryKey: makeCoinGeckoPriceQueryKey(coinGeckoId, currencyDenomination),
    queryFn: async (key: string, variables: CoinGeckoPriceVariables) => {
      const price = await fetchCoinGeckoPrice(
        variables.coinGeckoId as string, // safe to cast because queryFn is only called when config.enabled is true
        variables.currencyDenomination.toLowerCase()
      );
      return price;
    },
    config: { enabled: !!coinGeckoId },
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
