import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { SMART_CONTRACTS_REGISTRY } from "efi-ui/contracts/SmartContractsRegistry";

export function useSmartContractsFromFactory<TReturnContract extends Contract>(
  addresses: (string | undefined)[],
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): (TReturnContract | undefined)[] {
  const signer = signerOrProvider ?? jsonRpcProvider;
  const contracts = useMemo(
    () =>
      addresses.map((address) =>
        lookupSmartContract<TReturnContract>(address, factoryConnect, signer)
      ),
    [addresses, factoryConnect, signer]
  );

  return contracts;
}

function lookupSmartContract<TReturnContract extends Contract>(
  address: string | undefined,
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): TReturnContract | undefined {
  if (!address) {
    return undefined;
  }

  // Pull from cache if we have the instance already
  const cachedContract = SMART_CONTRACTS_REGISTRY[address];
  if (cachedContract) {
    return cachedContract as TReturnContract;
  }

  // Otherwise populate cache and return it
  SMART_CONTRACTS_REGISTRY[address] = factoryConnect(
    address,
    signerOrProvider ?? jsonRpcProvider
  );
  return SMART_CONTRACTS_REGISTRY[address] as TReturnContract;
}
