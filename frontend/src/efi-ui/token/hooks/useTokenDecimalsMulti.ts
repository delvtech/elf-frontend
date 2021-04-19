import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useTokenDecimalsMulti(
  tokenContracts: (ERC20 | ERC20Permit | undefined)[]
): QueryObserverResult<number>[] {
  return useSmartContractReadCalls(tokenContracts, "decimals", {
    infiniteCache: true,
  });
}
