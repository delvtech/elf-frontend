import { useEffect, useState } from "react";
import { useWeb3Context } from "web3-react";
import Web3 from "web3";
import { DEFAULT_WALLET_CONNECTORS } from "efi/wallets/connectors";

export interface AccountInfo {
  /**
   * Ethereum wallet address
   */
  address: string;

  /**
   * who's providing the connection, i.e. MetaMask
   */
  providerName: string;

  /**
   * is the wallet connected to the web app
   */
  isConnected: boolean;

  /**
   * The balance of Wei in the wallet
   */
  balance: string;

  /**
   * The balance of Eth in the wallet
   */
  ethBalance: string;
}

/**
 * returns wallet infos for accounts.  NOTE: This only returns one right now.
 */
export function useAccountInfo(): AccountInfo {
  const { account, library, connectorName } = useWeb3Context();
  const web3: Web3 = library;
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    address: "",
    providerName: "",
    isConnected: false,
    balance: "0",
    ethBalance: "0",
  });

  useEffect(() => {
    if (!account) {
      return;
    }

    (async () => {
      const accounts = await web3.eth.getAccounts();
      // TODO: return all accounts.  Metamask currently just returns the first connected account.
      const balance = await web3.eth.getBalance(accounts[0]);
      const ethBalance = web3.utils.fromWei(balance, "ether");
      const accountInfo = {
        address: accounts[0],
        providerName: connectorName ?? "Unknown",
        isConnected: true,
        balance,
        ethBalance,
      };
      setAccountInfo(accountInfo);
    })();
  }, [web3, connectorName, account]);

  return accountInfo;
}

export interface WalletConnection {
  isConnected: boolean;

  error: Error | null;
}
/**
 *  returns whether there is a wallet currently connected to the web app
 */
export const useWalletConnection = (): WalletConnection => {
  const { active, error, setFirstValidConnector } = useWeb3Context();

  useEffect(() => {
    // When there is an error, we want users to have to click to retry
    // establishing connection.
    const shouldSetConnector = !active && !error;
    if (!shouldSetConnector) {
      setFirstValidConnector(DEFAULT_WALLET_CONNECTORS);
    }
  }, [active, error, setFirstValidConnector]);

  const isConnected = active && !error;

  return { isConnected, error };
};
