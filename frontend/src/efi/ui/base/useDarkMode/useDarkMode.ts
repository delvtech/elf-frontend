import { queryCache, useQuery } from "react-query";

interface DarkMode {
  isDarkMode: boolean;
  setDarkMode: (isDarkMode: boolean) => void;
}

const DARK_MODE_QUERY_KEY = "isDarkMode";
const DARK_MODE_DEFAULT = false;

export function useDarkMode(): DarkMode {
  const { data: isDarkMode } = useQuery(
    DARK_MODE_QUERY_KEY,
    () => {
      const item = window.localStorage.getItem(DARK_MODE_QUERY_KEY);
      return item ? JSON.parse(item) : DARK_MODE_DEFAULT;
    },
    { initialData: DARK_MODE_DEFAULT }
  );

  return {
    isDarkMode,
    setDarkMode,
  };
}

function setDarkMode(darkMode: boolean) {
  // Save to local storage
  window.localStorage.setItem(DARK_MODE_QUERY_KEY, JSON.stringify(darkMode));

  // Invalidate so callers will re-ensure the data as needed
  queryCache.invalidateQueries(DARK_MODE_QUERY_KEY);
}
