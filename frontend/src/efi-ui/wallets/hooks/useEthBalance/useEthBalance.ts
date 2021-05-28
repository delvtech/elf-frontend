import { QueryObserverResult, useQuery } from "react-query";

import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

import { fetchEthBalance } from "efi/coins/ether/fetchEthBalance";

const ETH_BALANCE_QUERY_KEY = ["balanceOf", "ethereum"];

export function useEthBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined
): QueryObserverResult<BigNumber | undefined> {
  const etherBalanceResult = useQuery({
    queryKey: ETH_BALANCE_QUERY_KEY,
    queryFn: () => {
      return fetchEthBalance(library as Web3Provider, account as string);
    },
    enabled: !!library && !!account,
  });

  return etherBalanceResult;
}
