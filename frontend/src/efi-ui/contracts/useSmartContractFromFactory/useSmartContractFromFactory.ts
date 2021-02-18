import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useSmartContractFromFactory<TReturnContract extends Contract>(
  address: string | undefined,
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): TReturnContract | undefined {
  const contract = useMemo(() => {
    if (!address) {
      return;
    }
    const signer = signerOrProvider ?? jsonRpcProvider;
    return factoryConnect(address, signer);
  }, [address, factoryConnect, signerOrProvider]);

  return contract;
}
