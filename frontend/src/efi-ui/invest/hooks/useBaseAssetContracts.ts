import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { getQueriesData } from "efi-ui/base/queryResults";

/**
 * Gets a list of all the base asset contracts.
 */
export function useBaseAssetContracts(): (ERC20 | undefined)[] {
  const tranches = useTrancheContracts();

  // The token is the address to the base asset
  const underlyingTokenResults = useSmartContractReadCalls(
    tranches,
    "underlying"
  );

  // All base assets are known to be ERC20s
  const baseAssetContracts = useSmartContractsFromFactory(
    getQueriesData(underlyingTokenResults),
    ERC20__factory.connect
  );

  return baseAssetContracts;
}
