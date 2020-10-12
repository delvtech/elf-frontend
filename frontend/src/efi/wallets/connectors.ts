import { InjectedConnector } from "@web3-react/injected-connector";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { DEFAULT_CHAIN_IDS } from "efi/base/ethereum";
import { t } from "ttag";

/**
 * The 'injected' connector refers to plugin-based wallets like MetaMask, which
 * inject it's client library into the window object.
 */
export const injectedConnector = new InjectedConnector({
  supportedChainIds: DEFAULT_CHAIN_IDS,
});

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
    console.warn("Unkown connector", connector);
    return t`Uknown connector`;
  }

  return connectorName;
}
