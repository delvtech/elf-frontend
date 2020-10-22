import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { fetchEthBalance } from "efi/wallets/providers";
import { useQuery } from "react-query";

export function useWalletBalance() {
  const { library, account } = useWeb3React<Web3Provider>();

  const walletBalanceKey = makeWalletBalanceQueryKey(library, account);

  return useQuery(walletBalanceKey, async () => {
    if (library && account) {
      return fetchEthBalance(library, account);
    }
  });
}

function makeWalletBalanceQueryKey(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  // Interpolating values into the cache key that change over time will bust the
  // cache. This is how you make useQuery side-effects depend on async state :)
  return [library && "web3Provider", "wallet", account, "balance"];
}
