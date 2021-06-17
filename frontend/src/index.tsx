// CRA requires that this file live at the top-level, ie: src/index.tsx

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
import versionJson from "./version.output.json";
import { AddressesJson, lookupAddressKey } from "efi/addresses";
import efiLocalStorage from "efi/base/localStorage";
import SaveApp from "efi-ui/app/App/SaveApp/SaveApp";

clearLocalStorageOnNewVersion();
logAppVersion();

if (process.env.NODE_ENV === "development") {
  prefixDocumentTitle("(D)");
}
window.addresses = AddressesJson;
window.lookupAddressKey = lookupAddressKey;

const appId = process.env.ELEMENT_APP_ID;

ReactDOM.render(
  <Web3ReactProvider getLibrary={getEthereumProviderLibrary}>
    <QueryClientProvider client={efiQueryClient}>
      <React.StrictMode /* Only our components should be under strict mode */>
        {appId === "save" ? <SaveApp /> : <App />}
      </React.StrictMode>
    </QueryClientProvider>
  </Web3ReactProvider>,
  document.getElementById("root")
);

function clearLocalStorageOnNewVersion() {
  const lastVersion = efiLocalStorage.getItem("app-version");
  if (lastVersion !== versionJson.version) {
    const styles = [
      "background: #ffff00",
      "color: black",
      "display: block",
      "line-height: 40px",
      "text-align: center",
      "font-weight: bold",
      "font-size: 24px",
    ].join(";");

    // eslint-disable-next-line no-console
    console.log(
      "%c🤘 New app version detected, clearing local storage 🤘",
      styles
    );
    efiLocalStorage.clear();
    efiLocalStorage.setItem("app-version", versionJson.version);
  }
}

function prefixDocumentTitle(prefix: string) {
  document.title = `${prefix} ${document.title}`;
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

function logAppVersion() {
  const { version, date } = versionJson;
  const versionUrl = `https://github.com/element-fi/efi-frontend/commit/${version}`;
  const unreleasedUrl = `https://github.com/element-fi/efi-frontend/compare/${version}...master`;

  // eslint-disable-next-line no-console
  console.log(`%cBuild date: ${date}`, "font-size:12px");
  // eslint-disable-next-line no-console
  console.log(`%cApp version: ${versionUrl}`, "font-size:12px");
  // eslint-disable-next-line no-console
  console.log(
    `%cContracts: ${JSON.stringify(AddressesJson, null, 2)}`,
    "font-size:12px"
  );
  // eslint-disable-next-line no-console
  console.log(`%cUnreleased commits: ${unreleasedUrl}`, "font-size:12px");
}
