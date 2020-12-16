import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import { TorusConnector } from "@web3-react/torus-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { t } from "ttag";

import { ChainId, ChainNames, DEFAULT_CHAIN_IDS } from "efi/crypto/ethereum";
import { FORTMATIC_API_KEY } from "efi/fortmatic";
import { INFURA_URL } from "efi/infura";

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

/**
 * WalletConnect.  This provides access to many mobile wallets that use the wallet connect protocol
 * like Rainbow, Argent etc.
 */
export const walletConnectConnector = new WalletConnectConnector({
  rpc: { [ChainId.LOCAL]: ChainNames[ChainId.LOCAL] },
});

/**
 * WalletLink.  This provides access to coinbase wallet.
 */
export const walletLinkConnector = new WalletLinkConnector({
  url: INFURA_URL,
  appName: "Element Finance",
});

/**
 * Fortmatic web wallet.
 */
export const fortmaticConnector = new FortmaticConnector({
  // doesn't recognize LOCAL chainId, use mainnet for now
  chainId: ChainId.MAINNET,
  apiKey: FORTMATIC_API_KEY,
});

/**
 * Torus web wallet.
 */
export const torusConnector = new TorusConnector({
  chainId: ChainId.LOCAL,
});

export function getConnectorName(
  connector?: AbstractConnector | undefined,
  library?: Web3Provider | undefined
): string | undefined {
  if (!connector) {
    return undefined;
  }

  // Metamask is special. It's connector doesn't identify itself so we have to
  // use the library instead. :(
  if (isMetaMaskConnector(library)) {
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

export function isTorusConnector(
  connector: AbstractConnector
): connector is TorusConnector {
  return !!(connector as TorusConnector)?.torus;
}

export function isWalletConnectConnector(
  connector: AbstractConnector
): connector is WalletConnectConnector {
  return !!(connector as WalletConnectConnector)?.walletConnectProvider;
}

export function isFortmaticConnector(
  connector: AbstractConnector
): connector is FortmaticConnector {
  return !!(connector as FortmaticConnector)?.fortmatic;
}

export function isMetaMaskConnector(
  library?: Web3Provider | undefined
): boolean {
  return library?.connection?.url === "metamask";
}
