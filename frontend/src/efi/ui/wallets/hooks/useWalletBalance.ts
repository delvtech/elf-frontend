import { useQuery } from "react-query";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";

import { fetchEthBalance } from "efi/crypto/fetchEthBalance";
import { useERC20Balance } from "efi/ui/wallets/hooks/useERC20Balance";

import { ERC20Balance } from "./useERC20Balance";

export interface WalletBalances {
  ethBalance: BigNumber | undefined;
  wethBalance: ERC20Balance | undefined;
}
export function useWalletBalances(): WalletBalances {
  const { library, account } = useWeb3React<Web3Provider>();

  const walletBalanceKey = makeWalletBalanceQueryKey(library, account);
  const { data: ethBalance } = useQuery(walletBalanceKey, async () => {
    if (library && account) {
      return fetchEthBalance(library, account);
    }
  });

  const wethBalance = useERC20Balance("WETH", account);

  return { ethBalance, wethBalance };
}

export function makeWalletBalanceQueryKey(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  // Interpolating values into the cache key that change over time will bust the
  // cache. This is how you make useQuery side-effects depend on async state :)
  return [library && "web3Provider", "wallet", account, "balance"];
}
