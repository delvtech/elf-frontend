import { queryCache, useQuery } from "react-query";

import { Currencies, Currency } from "ts-money";

import efiLocalStorage from "efi/base/localStorage";

interface CurrencyPref {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CURRENCY_QUERY_KEY = "currency";
const CURRENCY_DEFAULT = Currencies.USD;

export function useCurrencyPref(): CurrencyPref {
  const { data: currency = CURRENCY_DEFAULT } = useQuery<Currency>(
    CURRENCY_QUERY_KEY,
    () => {
      const item = efiLocalStorage.getItem(CURRENCY_QUERY_KEY);
      return item ? JSON.parse(item) : CURRENCY_DEFAULT;
    }
  );

  return {
    currency,
    setCurrency,
  };
}

function setCurrency(currency: Currency) {
  // Save to local storage
  efiLocalStorage.setItem(CURRENCY_QUERY_KEY, JSON.stringify(currency));

  // Invalidate so callers will re-ensure the data as needed
  queryCache.invalidateQueries(CURRENCY_QUERY_KEY);
}
