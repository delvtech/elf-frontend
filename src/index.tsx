// CRA requires that this file live at the top-level, ie: src/index.tsx
// this file should only be used for development as it bundles all apps together

import "./stylesheets";
import "./index.css";
import "efi/debug/consoleEther";
import "efi/addresses";
// end our CSS

import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClientProvider } from "react-query";
import * as serviceWorker from "serviceWorker";

import App from "efi-ui/app/App/App";
import { getEthereumProviderLibrary } from "efi/wallets/providers";

import { efiQueryClient } from "./efi/queryClient";
import { AddressesJson, lookupAddressKey } from "efi/addresses";
import { clearLocalStorageOnNewVersion } from "./clearLocalStorageOnNewVersion";
import { prefixDocumentTitle } from "./prefixDocumentTitle";
import { logAppVersion } from "./logAppVersion";

clearLocalStorageOnNewVersion();
logAppVersion();
prefixDocumentTitle();

window.addresses = AddressesJson;
window.lookupAddressKey = lookupAddressKey;

ReactDOM.render(
  <Web3ReactProvider getLibrary={getEthereumProviderLibrary}>
    <QueryClientProvider client={efiQueryClient}>
      <React.StrictMode /* Only our components should be under strict mode */>
        <App />
      </React.StrictMode>
    </QueryClientProvider>
  </Web3ReactProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
