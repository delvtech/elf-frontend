import { useERC20Contracts } from "efi-ui/contracts/useERC20Contracts/useERC20Contracts";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useElfContractsFromTranches } from "./useElfContractsFromTranches";

/**
 * Gets a list of all the tranche contracts.
 */
export function useBaseAssetContracts() {
  const trancheContracts = useTrancheContracts(jsonRpcProvider);

  // The elf contract from the tranche tells us the base asset
  const elfContracts = useElfContractsFromTranches(trancheContracts);

  // The token is the address to the base asset
  const baseAssetAddressesResult = useSmartContractReadCalls(
    elfContracts,
    "token"
  );
  const baseAssetAddresses = baseAssetAddressesResult.map(
    (result) => result.data
  );

  // All base assets are known to be ERC20s
  const baseAssetContracts = useERC20Contracts(
    baseAssetAddresses,
    jsonRpcProvider
  );

  return baseAssetContracts;
}
