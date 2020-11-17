import { queryCache, useQuery } from "react-query";

import { Classes } from "@blueprintjs/core";

import efiLocalStorage from "efi/base/localStorage";

interface DarkMode {
  isDarkMode: boolean;
  darkModeClassName: string | undefined;
  setDarkMode: (isDarkMode: boolean) => void;
}

const DARK_MODE_QUERY_KEY = "isDarkMode";
export const DARK_MODE_DEFAULT = false;

export function useDarkMode(): DarkMode {
  const { data: isDarkMode = DARK_MODE_DEFAULT } = useQuery(
    DARK_MODE_QUERY_KEY,
    () => {
      const item = efiLocalStorage.getItem(DARK_MODE_QUERY_KEY);
      return item ? JSON.parse(item) : DARK_MODE_DEFAULT;
    }
  );

  const darkModeClassName = isDarkMode ? Classes.DARK : undefined;

  return {
    isDarkMode,
    darkModeClassName,
    setDarkMode,
  };
}

function setDarkMode(darkMode: boolean) {
  // Save to local storage
  efiLocalStorage.setItem(DARK_MODE_QUERY_KEY, JSON.stringify(darkMode));

  // Invalidate so callers will re-ensure the data as needed
  queryCache.invalidateQueries(DARK_MODE_QUERY_KEY);
}
