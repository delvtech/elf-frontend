import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { defaultProvider } from "efi/providers/providers";

// Do not export this from this file
const SMART_CONTRACTS_REGISTRY: Record<string, unknown> = {};

export function getSmartContractFromRegistry<TReturnContract extends Contract>(
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
    signerOrProvider ?? defaultProvider
  );

  return SMART_CONTRACTS_REGISTRY[address] as TReturnContract;
}

export function getSmartContractFromRegistryMulti<
  TReturnContract extends Contract
>(
  address: (string | undefined)[],
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): (TReturnContract | undefined)[] {
  return address.map((address) =>
    getSmartContractFromRegistry(address, factoryConnect, signerOrProvider)
  );
}
