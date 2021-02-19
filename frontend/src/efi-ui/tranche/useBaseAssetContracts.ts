import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { useElfContracts } from "efi-ui/contracts/useElfContracts/useElfContracts";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * Gets a list of all the tranche contracts.
 */
export function useBaseAssetContracts() {
  // The elf contracts contain the base asset
  const elfContracts = useElfContracts(jsonRpcProvider);

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
