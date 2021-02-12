import { ERC20 } from "elf-contracts/types/ERC20";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenDecimals(
  contract: ERC20 | undefined
): ComputedQueryResult<number> {
  const result = useSmartContractReadCall(contract, "decimals");
  return [result.data, [result]];
}
