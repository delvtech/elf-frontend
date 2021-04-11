// CRA requires that this file live at the top-level, ie: src/index.tsx

import "./stylesheets";
import "./index.css";
import "efi/debug/consoleEther";
import "efi/contracts/contractsJson";
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
import ContractAddresses, {
  lookupAddressKey,
} from "efi/contracts/contractsJson";

logAppVersion();

if (process.env.NODE_ENV === "development") {
  prefixDocumentTitle("(D)");
}
window.addresses = ContractAddresses;
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
  console.log(`%cUnreleased commits: ${unreleasedUrl}`, "font-size:12px");
}
