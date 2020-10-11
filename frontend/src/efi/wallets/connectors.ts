import { InjectedConnector } from "@web3-react/injected-connector";
import { ChainIds, DEFAULT_CHAIN_IDS } from "efi/base/ethereum";

/**
 * The 'injected' connector refers to plugin-based wallets like MetaMask, which
 * inject it's client library into the window object.
 */
export const injectedConnector = new InjectedConnector({
  supportedChainIds: DEFAULT_CHAIN_IDS,
});
