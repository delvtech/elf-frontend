// CRA requires that this file live at the top-level, ie: src/index.tsx
// this file should only be used for development as it bundles all apps together

import "./stylesheets";
import "./index.css";
import "efi/debug/consoleEther";
import "efi/addresses";
// end our CSS

import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import React, { ReactElement, useEffect } from "react";
import { QueryClientProvider } from "react-query";

import App from "efi-ui/app/App/App";
import { useClearLocalStorageOnNewVersion } from "efi-ui/base/useClearLocalStorageOnNewVersion";
import { getEthereumProviderLibrary } from "efi/wallets/providers";

import { efiQueryClient } from "efi/queryClient";
import { AddressesJson, lookupAddressKey } from "efi/addresses";
import { logAppVersion } from "logAppVersion";

logAppVersion();

function ElementUI({ Component, pageProps }: AppProps): ReactElement {
  useClearLocalStorageOnNewVersion();
  useEffect(() => {
    window.addresses = AddressesJson;
    window.lookupAddressKey = lookupAddressKey;
  }, []);
  return (
    <Web3ReactProvider getLibrary={getEthereumProviderLibrary}>
      <QueryClientProvider client={efiQueryClient}>
        <React.StrictMode /* Only our components should be under strict mode */>
          <App>
            <Component {...pageProps} />
          </App>
        </React.StrictMode>
      </QueryClientProvider>
    </Web3ReactProvider>
  );
}

export default ElementUI;
