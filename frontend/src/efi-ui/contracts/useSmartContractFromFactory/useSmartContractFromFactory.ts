import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { getSmartContractFromRegistry } from "efi-ui/contracts/SmartContractsRegistry";
import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useSmartContractFromFactory<TReturnContract extends Contract>(
  address: string | undefined,
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): TReturnContract | undefined {
  const signer = signerOrProvider ?? jsonRpcProvider;
  const contract = useMemo(() => {
    return getSmartContractFromRegistry<TReturnContract>(
      address,
      factoryConnect,
      signer
    );
  }, [address, factoryConnect, signer]);

  return contract;
}

export function useSmartContractFromFactoryMulti<
  TReturnContract extends Contract
>(
  addresses: (string | undefined)[],
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): (TReturnContract | undefined)[] {
  const signer = signerOrProvider ?? jsonRpcProvider;
  const contracts = useMemo(
    () =>
      addresses.map((address) =>
        getSmartContractFromRegistry<TReturnContract>(
          address,
          factoryConnect,
          signer
        )
      ),
    [addresses, factoryConnect, signer]
  );

  return contracts;
}
