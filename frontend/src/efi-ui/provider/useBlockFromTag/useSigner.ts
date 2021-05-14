import { useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

export function useSigner(
  account: string | null | undefined,
  library: Web3Provider | undefined
): Signer | undefined {
  return useMemo(() => {
    return account ? (library?.getSigner(account) as Signer) : undefined;
  }, [account, library]);
}
