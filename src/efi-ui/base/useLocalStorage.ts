import { elfLocalStorage } from "efi/base/localStorage";

export type LocalStorage = {
  getItem: (key: string) => string;
  setItem: (key: string, value: string) => boolean;
  clear: () => void;
};

export function useLocalStorage(): LocalStorage {
  const isBrowser: boolean = typeof window !== "undefined";

  const getItem = (key: string): string => {
    return isBrowser ? elfLocalStorage[key] : "";
  };

  const setItem = (key: string, value: string): boolean => {
    if (isBrowser) {
      elfLocalStorage.setItem(key, value);
      return true;
    }

    return false;
  };

  const clear = (): void => {
    elfLocalStorage.clear();
  };

  return {
    getItem,
    setItem,
    clear,
  };
}
