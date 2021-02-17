import { useElfContracts } from "efi-ui/contracts/useElfContracts/useElfContracts";
import { useERC20Contracts } from "efi-ui/contracts/useERC20Contracts/useERC20Contracts";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * Gets a list of all the tranche contracts.
 */
export function useBaseAssetContracts() {
  const trancheContracts = useTrancheContracts(jsonRpcProvider);

  // The elf contract assigned to the tranche tells us the base asset
  const elfAddressesResult = useSmartContractReadCalls(trancheContracts, "elf");
  const elfAddresses = elfAddressesResult.map((result) => result.data);

  // The token is the address to the base asset
  const elfContracts = useElfContracts(elfAddresses, jsonRpcProvider);
  const baseAssetAddressesResult = useSmartContractReadCalls(
    elfContracts,
    "token"
  );
  const baseAssetAddresses = baseAssetAddressesResult.map(
    (result) => result.data
  );

  const baseAssetContracts = useERC20Contracts(
    baseAssetAddresses,
    jsonRpcProvider
  );
  return baseAssetContracts;
}
