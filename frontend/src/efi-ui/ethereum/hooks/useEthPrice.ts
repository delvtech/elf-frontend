import { Currency, Money } from "ts-money";

import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { QueryObserverResult } from "react-query";

export function useEthPrice(currency: Currency): QueryObserverResult<Money> {
  return useCoinGeckoPrice("ethereum", currency);
}
