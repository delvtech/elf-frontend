import { AbstractConnector } from "@web3-react/abstract-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import { t } from "ttag";

import { DEFAULT_CHAIN_IDS } from "efi/crypto/ethereum";

/**
 * The 'injected' connector refers to plugin-based wallets like MetaMask, which
 * inject it's client library into the window object.
 */
export const injectedConnector = new InjectedConnector({
  supportedChainIds: DEFAULT_CHAIN_IDS,
});

// Patch chainChanged 0xNaN causing app to crash when switching from the mainnet
// to localnet. See: https://github.com/NoahZinsmeister/web3-react/issues/73
//@ts-ignore
const originalChainIdChangeHandler = injectedConnector.handleChainChanged;
//@ts-ignore
injectedConnector.handleChainChanged = (chainId: string | number) => {
  // preserve the existing console log from the
  // eslint-disable-next-line no-console
  console.debug("Handling 'chainChanged' event with payload", chainId);
  if (chainId === "0xNaN") {
    return; //Ignore 0xNaN, when user doesn't set chainId
  }
  originalChainIdChangeHandler(chainId);
};

const ConnectorsByName: Record<string, AbstractConnector> = {
  Injected: injectedConnector,
};

export function getConnectorName(connector?: AbstractConnector): string {
  if (!connector) {
    return t`No connector`;
  }

  // Lookup the connector name
  const connectorName = Object.keys(ConnectorsByName).find(
    (name) => ConnectorsByName[name] === connector
  );

  if (!connectorName) {
    return t`Uknown connector`;
  }

  return connectorName;
}
