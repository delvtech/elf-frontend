import { Provider } from "@ethersproject/providers";
import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { Contract, Signer } from "ethers";

// Do not export this from this file
const SMART_CONTRACTS_REGISTRY: Record<string, unknown> = {};

/**
 * Gets registered smart contract instance, or creates, registers, and returns
 * it if it doesn't exist.
 */
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
    signerOrProvider ?? jsonRpcProvider
  );
  return SMART_CONTRACTS_REGISTRY[address] as TReturnContract;
}
