import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useSmartContractsFromFactory<TReturnContract extends Contract>(
  addresses: (string | undefined)[],
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): (TReturnContract | undefined)[] {
  const signer = signerOrProvider ?? jsonRpcProvider;
  const contracts = useMemo(
    () =>
      addresses.map((address) => {
        if (!address) {
          return undefined;
        }
        return factoryConnect(address, signer);
      }),
    [addresses, factoryConnect, signer]
  );

  return contracts;
}
