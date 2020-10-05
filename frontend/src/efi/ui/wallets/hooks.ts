import { useEffect, useState } from "react";
import { t } from "ttag";
import { useWeb3Context } from "web3-react";
import Web3 from "web3";

export interface AccountInfo {
  address: string;
  providerName: string;
  connected: boolean;
  balance: string;
  ethBalance: string;
}

export const useAccountInfo = (): AccountInfo => {
  const { library, connectorName } = useWeb3Context();
  const web3: Web3 = library;
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    address: '',
    providerName: '',
    connected: false,
    balance: '0',
    ethBalance: '0',
  });

  useEffect(() => {
    const getInfo = async () => {
      const accounts = await web3.eth.getAccounts();
      // TODO: return all accounts.  Metamask currently just returns the first connected account.
      const balance = await web3.eth.getBalance(accounts[0]);
      const ethBalance = web3.utils.fromWei(balance, "ether");
      const accountInfo = {
        address: accounts[0],
        providerName:  connectorName ?? 'Unknown',
        connected: true,
        balance,
        ethBalance,
      };
      setAccountInfo(accountInfo);
    }
    getInfo();
  }, [web3, connectorName]);

  return accountInfo;
}

export const useWalletConnection = (): boolean => {
  const { active, error, setFirstValidConnector }= useWeb3Context();
  const hasWalletConnection = active && !error;
  useEffect(() => {
      if (!hasWalletConnection) {
        setFirstValidConnector(['MetaMask', 'Infura']);
      }
  }, [hasWalletConnection, setFirstValidConnector]);

  return hasWalletConnection;
}