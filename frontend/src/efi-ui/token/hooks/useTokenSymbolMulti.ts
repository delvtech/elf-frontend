import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { ERC20 } from "elf-contracts/types/ERC20";
import { QueryObserverResult } from "react-query";

export function useTokenSymbolMulti(
  tokenContracts: (ERC20 | ERC20Permit | undefined)[]
): QueryObserverResult<string>[] {
  return useSmartContractReadCalls(tokenContracts, "symbol", {
    infiniteCache: true,
  });
}
