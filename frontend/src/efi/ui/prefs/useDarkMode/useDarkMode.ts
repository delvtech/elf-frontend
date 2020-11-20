import { Classes } from "@blueprintjs/core";

import { usePref } from "efi/ui/prefs/usePref/usePref";

interface DarkMode {
  isDarkMode: boolean;
  darkModeClassName: string | undefined;
  setDarkMode: (isDarkMode: boolean) => void;
}

const DARK_MODE_PREF_ID = "isDarkMode";
export const DARK_MODE_DEFAULT = false;

export function useDarkMode(): DarkMode {
  const { pref: isDarkMode, setPref: setDarkMode } = usePref(
    DARK_MODE_PREF_ID,
    DARK_MODE_DEFAULT
  );

  const darkModeClassName = isDarkMode ? Classes.DARK : undefined;

  return {
    isDarkMode,
    darkModeClassName,
    setDarkMode,
  };
}
