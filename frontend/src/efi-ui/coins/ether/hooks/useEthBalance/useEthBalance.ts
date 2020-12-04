import { Web3Provider } from "@ethersproject/providers";
import { useQuery } from "react-query";

import { fetchEthBalance } from "efi/coins/ether/fetchEthBalance";

export function useEthBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  const walletBalanceKey = makeEtherBalanceQueryKey(library, account);
  const etherBalanceResult = useQuery(walletBalanceKey, async () => {
    if (library && account) {
      return fetchEthBalance(library, account);
    }
  });

  return etherBalanceResult;
}

function makeEtherBalanceQueryKey(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  // Interpolating values in the cache key that change over time will bust the
  // cache when they update.
  return [[library && "web3Provider", "wallet", account, "balance"]];
}
