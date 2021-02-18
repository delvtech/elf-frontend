import { useElfContracts } from "efi-ui/contracts/useElfContracts/useElfContracts";
import { useERC20Contracts } from "efi-ui/contracts/useERC20Contracts/useERC20Contracts";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
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
  const baseAssetContracts = useERC20Contracts(
    baseAssetAddresses,
    jsonRpcProvider
  );

  return baseAssetContracts;
}
