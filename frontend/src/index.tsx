/**
 * CRA requires that this file live at the top-level, ie: src/index.tsx
 */

import React from "react";
import ReactDOM from "react-dom";
import Web3Provider, { Connectors } from 'web3-react'
import Web3 from 'web3';

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

// Import tailwind after blueprint so that applying tailwind classes to
// blueprint components overrides the blueprint styling
import "./tailwind.output.css";

import "./index.css";

import App from "efi/ui/app/App/App";
import * as serviceWorker from "serviceWorker";

const { InjectedConnector, NetworkOnlyConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })

// keep around for now for testing
// const Infura = new NetworkOnlyConnector({
//   providerURL: 'https://mainnet.infura.io/v3/e0fa283e03bd41229e7d19cb630f1cdd',
// })

const connectors = { MetaMask }

ReactDOM.render(
  <React.StrictMode>
    <Web3Provider connectors={connectors} libraryName={'web3.js'} web3Api={Web3}>
      <App />
    </Web3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
