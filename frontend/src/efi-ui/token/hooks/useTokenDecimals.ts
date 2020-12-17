import { Erc20 } from "elf-contracts/types/Erc20";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenDecimals(contract: Erc20): ComputedQueryResult<number> {
  const result = useSmartContractReadCall(contract, "decimals");
  return [result.data?.[0], [result]];
}
