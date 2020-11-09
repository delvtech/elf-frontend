import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { TorusConnector } from "@web3-react/torus-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { INFURA_URL } from "infura";
import { t } from "ttag";

import { ChainId, ChainNames, DEFAULT_CHAIN_IDS } from "efi/crypto/ethereum";
import { FORTMATIC_API_KEY } from "efi/fortmatic";

/**
 * The 'injected' connector refers to plugin-based wallets like MetaMask, which
 * inject it's client library into the window object.
 */
export const injectedConnector = new InjectedConnector({
  supportedChainIds: DEFAULT_CHAIN_IDS,
});

/**
 * WalletConnect.  This provides access to many mobile wallets that use the wallet connect protocol
 * like Rainbow, Argent etc.
 */
export const walletConnectConnector = new WalletConnectConnector({
  rpc: { [ChainId.MAINNET]: ChainNames[ChainId.MAINNET] },
});

/**
 * Ledger hardware wallet.
 */
export const ledgerConnector = new LedgerConnector({
  chainId: ChainId.MAINNET,
  url: INFURA_URL,
});

/**
 * Fortmatic web wallet.
 */
export const fortmaticConnector = new FortmaticConnector({
  chainId: ChainId.MAINNET,
  apiKey: FORTMATIC_API_KEY,
});

/**
 * Torus web wallet.
 */
export const torusConnector = new TorusConnector({
  chainId: ChainId.MAINNET,
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

export function getConnectorName(
  connector?: AbstractConnector | undefined,
  library?: Web3Provider | undefined
): string {
  if (!connector) {
    return t`No connector`;
  }

  if (isMetaMaskConnector(library?.connection?.url)) {
    return "MetaMask";
  }

  if (isTorusConnector(connector)) {
    return "Torus";
  }

  if (isWalletConnectConnector(connector)) {
    const walletBrand =
      connector.walletConnectProvider?.wc?._peerMeta?.name || t`unknown`;
    return `WalletConnect (${walletBrand})`;
  }

  if (isFortmaticConnector(connector)) {
    return "Fortmatic";
  }

  return t`Uknown connector`;
}

const isTorusConnector = (
  connector: AbstractConnector
): connector is TorusConnector => {
  return !!(connector as TorusConnector)?.torus;
};

const isWalletConnectConnector = (
  connector: AbstractConnector
): connector is WalletConnectConnector => {
  return !!(connector as WalletConnectConnector)?.walletConnectProvider;
};

const isFortmaticConnector = (
  connector: AbstractConnector
): connector is FortmaticConnector => {
  return !!(connector as FortmaticConnector)?.fortmatic;
};

const isMetaMaskConnector = (url: string | undefined): boolean => {
  return url === "metamask";
};
