import { Provider } from "@ethersproject/providers";
import { Contract, Signer } from "ethers";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { FactoryConnectFn } from "efi/contracts/FactoryConnectFn";
import { defaultProvider } from "efi/providers/providers";

/**
 * @deprecated hooks-based access for smart contracts is deprecated. Use
 * getSmartContractFromRegistry instead.
 */
export function useSmartContractFromFactory<TReturnContract extends Contract>(
  address: string | undefined,
  factoryConnect: FactoryConnectFn<TReturnContract>,
  signerOrProvider?: Signer | Provider
): TReturnContract | undefined {
  const signer = signerOrProvider ?? defaultProvider;
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
  const signer = signerOrProvider ?? defaultProvider;
  return addresses.map((address) =>
    getSmartContractFromRegistry<TReturnContract>(
      address,
      factoryConnect,
      signer
    )
  );
}
