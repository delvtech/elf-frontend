import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import { injectedConnector } from "efi/wallets/connectors";

export function useEagerConnect() {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(
    () => {
      (async () => {
        const isAuthorized = await injectedConnector.isAuthorized();
        if (isAuthorized) {
          try {
            await activate(injectedConnector, undefined, true);
          } catch {
            setTried(true);
          }
        } else {
          setTried(true);
        }
      })();
    },
    // Check once on mount to see if we've already been authorized before and
    // can auto-activate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}
