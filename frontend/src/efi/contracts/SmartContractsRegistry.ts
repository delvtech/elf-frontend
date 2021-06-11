import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { defaultProvider } from "efi/providers/providers";

// Do not export this from this file
const SMART_CONTRACTS_REGISTRY: Record<string, unknown> = {};

const SMART_CONTRACTS_REGISTRY_STATIC: Record<
  string,
  Record<string, unknown>
> = {};

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

interface ContractFactory<TReturnContract extends Contract> {
  connect: (
    address: string,
    signerOrProvider: Signer | Provider
  ) => TReturnContract;
}

/**
 * @deprecated The smart contract registry is deprecated in favor of lookup
 * objects like trancheContracts, interestTokenContracts, etc...
 */
export function getSmartContractFromRegistryStatic<
  TReturnContract extends Contract
>(
  address: string,
  Factory: ContractFactory<TReturnContract>,
  signerOrProvider?: Signer | Provider
): TReturnContract {
  // not sure how to type this correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const factory = new (Factory as any)();
  // get the name of the factory
  const type = factory.constructor.name;

  // Pull from cache if we have the instance already
  const cachedContract = SMART_CONTRACTS_REGISTRY_STATIC[address]?.[type];
  if (cachedContract) {
    return cachedContract as TReturnContract;
  }

  // Otherwise populate cache and return it
  SMART_CONTRACTS_REGISTRY_STATIC[address] = {};
  SMART_CONTRACTS_REGISTRY_STATIC[address][type] = Factory.connect(
    address,
    signerOrProvider ?? defaultProvider
  );

  return SMART_CONTRACTS_REGISTRY_STATIC[address][type] as TReturnContract;
}
