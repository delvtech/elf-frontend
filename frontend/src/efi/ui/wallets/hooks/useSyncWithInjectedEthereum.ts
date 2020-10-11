import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { injectedConnector } from "efi/wallets/connectors";
import { ChainIds, NetworkIds } from "efi/base/ethereum";

/**
 * It's possible for an ethereum client to exist on window, which can change
 * state out from under the app. For example, disconnecting directly from the
 * MetaMask plugin will trigger events on the window.ethereum client.
 *
 * This effect keeps the app's Web3 context in sync w/ window.ethereum (if it
 * exists).
 */
export function useSyncWithInjectedEthereum(suppress = false) {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window;

    if (!ethereum.on || suppress || error || active) {
      return;
    }

    const handleChainChanged = (chainId: ChainIds) => {
      console.log("chainChanged", chainId);
      activate(injectedConnector);
    };

    const handleAccountsChanged = (accounts: any) => {
      console.log("accountsChanged", accounts);
      if (accounts.length > 0) {
        activate(injectedConnector);
      }
    };

    const handleNetworkChanged = (networkId: NetworkIds) => {
      console.log("networkChanged", networkId);
      activate(injectedConnector);
    };

    ethereum.on("chainChanged", handleChainChanged);
    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("networkChanged", handleNetworkChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("chainChanged", handleChainChanged);
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("networkChanged", handleNetworkChanged);
      }
    };
  }, [active, error, suppress, activate]);
}
