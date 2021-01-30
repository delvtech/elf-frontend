import { useCallback, useMemo } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";

import { efiQueryClient } from "efi/queryClient";

interface CryptoDrawer {
  cryptoDrawerIsOpen: boolean;
  openCryptoDrawer: () => void;
  closeCryptoDrawer: () => void;
}

const DRAWER_CRYPTO_IS_OPEN_QUERY_KEY = ["drawer", "crypto", "isOpen"];
const DRAWER_IS_OPEN_DEFAULT = false;

export function useCryptoDrawer(): CryptoDrawer {
  const queryClient = useQueryClient();
  const { data } = useQuery<boolean | undefined>(
    DRAWER_CRYPTO_IS_OPEN_QUERY_KEY,
    async () => {
      const drawerIsOpen = efiQueryClient.getQueryData<boolean>(
        DRAWER_CRYPTO_IS_OPEN_QUERY_KEY
      );
      return drawerIsOpen;
    }
  );

  const cryptoDrawerIsOpen = data || DRAWER_IS_OPEN_DEFAULT;
  const closeCryptoDrawer = useCallback(
    () => setCryptoDrawerIsOpen(queryClient, false),
    [queryClient]
  );
  const openCryptoDrawer = useCallback(
    () => setCryptoDrawerIsOpen(queryClient, true),
    [queryClient]
  );

  const cryptoDawer = useMemo<CryptoDrawer>(
    () => ({
      cryptoDrawerIsOpen,
      openCryptoDrawer,
      closeCryptoDrawer,
    }),
    [closeCryptoDrawer, cryptoDrawerIsOpen, openCryptoDrawer]
  );

  return cryptoDawer;
}

function setCryptoDrawerIsOpen(
  queryClient: QueryClient,
  drawerIsOpen: boolean
) {
  queryClient.setQueryData(DRAWER_CRYPTO_IS_OPEN_QUERY_KEY, () => drawerIsOpen);
  // Invalidate so callers will re-ensure the data as needed
  queryClient.invalidateQueries(DRAWER_CRYPTO_IS_OPEN_QUERY_KEY);
}
