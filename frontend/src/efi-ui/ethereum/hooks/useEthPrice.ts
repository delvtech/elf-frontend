import { Currency } from "ts-money";

import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";

export function useEthPrice(currency: Currency) {
  return useCoinGeckoPrice("ethereum", currency);
}
