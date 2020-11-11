import { queryCache, useQuery } from "react-query";

import efiLocalStorage from "efi/base/localStorage";

interface CurrencyPref {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CURRENCY_QUERY_KEY = "currency";
const CURRENCY_DEFAULT = "usd";

export function useCurrencyPref(): CurrencyPref {
  const { data: currency = CURRENCY_DEFAULT } = useQuery<string>(
    CURRENCY_QUERY_KEY,
    () => {
      const item = efiLocalStorage.getItem(CURRENCY_QUERY_KEY);
      return item ? JSON.parse(item) : CURRENCY_DEFAULT;
    },
    { placeholderData: CURRENCY_DEFAULT }
  );

  return {
    // safe to cast when placeholder is set in useQuery
    currency,
    setCurrency,
  };
}

function setCurrency(currency: string) {
  // Save to local storage
  efiLocalStorage.setItem(CURRENCY_QUERY_KEY, JSON.stringify(currency));

  // Invalidate so callers will re-ensure the data as needed
  queryCache.invalidateQueries(CURRENCY_QUERY_KEY);
}
