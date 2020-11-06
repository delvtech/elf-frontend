import { useCallback } from "react";
import { queryCache, useQuery } from "react-query";

interface CryptoDrawer {
  cryptoDrawerIsOpen: boolean;
  setCryptoDrawerIsOpen: (isOpen: boolean) => void;
  openCryptoDrawer: () => void;
  closeCryptoDrawer: () => void;
}

const DRAWER_CRYPTO_IS_OPEN_QUERY_KEY = ["drawer", "crypto", "isOpen"];
const DRAWER_IS_OPEN_DEFAULT = false;

export function useCryptoDrawer(): CryptoDrawer {
  const { data } = useQuery<boolean>(
    DRAWER_CRYPTO_IS_OPEN_QUERY_KEY,
    () => {
      const item = window.localStorage.getItem(
        DRAWER_CRYPTO_IS_OPEN_QUERY_KEY.join()
      );
      return item ? JSON.parse(item) : DRAWER_IS_OPEN_DEFAULT;
    },
    { placeholderData: DRAWER_IS_OPEN_DEFAULT }
  );

  const cryptoDrawerIsOpen = data || DRAWER_IS_OPEN_DEFAULT;

  const closeCryptoDrawer = useCallback(() => setCryptoDrawerIsOpen(false), []);
  const openCryptoDrawer = useCallback(() => setCryptoDrawerIsOpen(true), []);

  return {
    cryptoDrawerIsOpen,
    setCryptoDrawerIsOpen,
    openCryptoDrawer,
    closeCryptoDrawer,
  };
}

function setCryptoDrawerIsOpen(drawerIsOpen: boolean) {
  // Save to local storage
  window.localStorage.setItem(
    DRAWER_CRYPTO_IS_OPEN_QUERY_KEY.join(),
    JSON.stringify(drawerIsOpen)
  );

  // Invalidate so callers will re-ensure the data as needed
  queryCache.invalidateQueries(DRAWER_CRYPTO_IS_OPEN_QUERY_KEY);
}
