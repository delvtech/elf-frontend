import { useCallback, useMemo } from "react";
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
  const { data } = useQuery<boolean | undefined>(
    DRAWER_CRYPTO_IS_OPEN_QUERY_KEY,
    async () => {
      const drawerIsOpen = queryCache.getQueryData<boolean>(
        DRAWER_CRYPTO_IS_OPEN_QUERY_KEY
      );
      return drawerIsOpen;
    }
  );

  const cryptoDrawerIsOpen = data || DRAWER_IS_OPEN_DEFAULT;
  const closeCryptoDrawer = useCallback(() => setCryptoDrawerIsOpen(false), []);
  const openCryptoDrawer = useCallback(() => setCryptoDrawerIsOpen(true), []);

  const cryptoDawer: CryptoDrawer = useMemo(
    () => ({
      cryptoDrawerIsOpen,
      setCryptoDrawerIsOpen,
      openCryptoDrawer,
      closeCryptoDrawer,
    }),
    [closeCryptoDrawer, cryptoDrawerIsOpen, openCryptoDrawer]
  );

  return cryptoDawer;
}

function setCryptoDrawerIsOpen(drawerIsOpen: boolean) {
  queryCache.setQueryData(DRAWER_CRYPTO_IS_OPEN_QUERY_KEY, () => drawerIsOpen);
  // Invalidate so callers will re-ensure the data as needed
  queryCache.invalidateQueries(DRAWER_CRYPTO_IS_OPEN_QUERY_KEY);
}
