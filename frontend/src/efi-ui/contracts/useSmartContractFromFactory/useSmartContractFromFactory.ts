import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { getSmartContractFromRegistry } from "efi-ui/contracts/SmartContractsRegistry";
import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * @deprecated hooks-based access for smart contracts is deprecated. Use
 * getSmartContractFromRegistry instead.
 */
export function useSmartContractFromFactory<TReturnContract extends Contract>(
  address: string | undefined,
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): TReturnContract | undefined {
  const signer = signerOrProvider ?? jsonRpcProvider;
  return getSmartContractFromRegistry<TReturnContract>(
    address,
    factoryConnect,
    signer
  );
}

/**
 * @deprecated hooks-based access for smart contracts is deprecated. Use
 * getSmartContractFromRegistryMulti instead.
 */
export function useSmartContractFromFactoryMulti<
  TReturnContract extends Contract
>(
  addresses: (string | undefined)[],
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): (TReturnContract | undefined)[] {
  const signer = signerOrProvider ?? jsonRpcProvider;
  return addresses.map((address) =>
    getSmartContractFromRegistry<TReturnContract>(
      address,
      factoryConnect,
      signer
    )
  );
}
