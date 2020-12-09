/**
 * CRA requires that this file live at the top-level, ie: src/index.tsx
 */

import "normalize.css/normalize.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "fontsource-open-sans";

import React from "react";
import ReactDOM from "react-dom";

// Import tailwind after blueprint so that applying tailwind classes to
// blueprint components overrides the blueprint styling
import "./tailwind.output.css";
import "./index.css";

import { Web3ReactProvider } from "@web3-react/core";
import * as serviceWorker from "serviceWorker";

import App from "efi-ui/app/App/App";
import { getEthereumProviderLibrary } from "efi/wallets/providers";

import versionJson from "./version.output.json";

logAppVersion();

if (process.env.NODE_ENV === "development") {
  prefixDocumentTitle("(D)");
}
ReactDOM.render(
  <Web3ReactProvider getLibrary={getEthereumProviderLibrary}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
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
