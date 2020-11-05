import { queryCache, useQuery } from "react-query";

<<<<<<< HEAD
import efiLocalStorage from "efi/base/localStorage";
=======
import { Classes } from "@blueprintjs/core";
>>>>>>> 36f6330... add darkModeClassName, scrolling, remove selector

interface DarkMode {
  isDarkMode: boolean;
  darkModeClassName: string | undefined;
  setDarkMode: (isDarkMode: boolean) => void;
}

const DARK_MODE_QUERY_KEY = "isDarkMode";
const DARK_MODE_DEFAULT = false;

export function useDarkMode(): DarkMode {
  const { data: isDarkMode } = useQuery<boolean>(
    DARK_MODE_QUERY_KEY,
    () => {
      const item = efiLocalStorage.getItem(DARK_MODE_QUERY_KEY);
      return item ? JSON.parse(item) : DARK_MODE_DEFAULT;
    },
    { placeholderData: DARK_MODE_DEFAULT }
  );

  const darkModeClassName = isDarkMode ? Classes.DARK : undefined;

  return {
    // safe to cast when placeholder is set in useQuery
    isDarkMode: isDarkMode as boolean,
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
