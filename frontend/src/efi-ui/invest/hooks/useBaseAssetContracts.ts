import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { useYVaultAssetProxyContracts } from "efi-ui/contracts/useYVaultAssetProxyContracts/useYVaultAssetProxyContracts";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * Gets a list of all the tranche contracts.
 */
export function useBaseAssetContracts(): (ERC20 | undefined)[] {
  // The elf contracts contain the base asset
  const elfContracts = useYVaultAssetProxyContracts(jsonRpcProvider);

  // The token is the address to the base asset
  const baseAssetAddressesResult = useSmartContractReadCalls(
    elfContracts,
    "token"
  );
  const baseAssetAddresses = baseAssetAddressesResult.map(
    (result) => result.data
  );

  // All base assets are known to be ERC20s
  const baseAssetContracts = useSmartContractsFromFactory(
    baseAssetAddresses,
    ERC20__factory.connect,
    jsonRpcProvider
  );

  return baseAssetContracts;
}
