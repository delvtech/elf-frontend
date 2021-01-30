import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";

export function useEthPrice(currencyDenomination = "usd") {
  return useCoinGeckoPrice("ethereum", currencyDenomination);
}
