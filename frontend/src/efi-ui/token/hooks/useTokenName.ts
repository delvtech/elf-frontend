import { ERC20 } from "elf-contracts/types/ERC20";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenName(contract: Erc20): ComputedQueryResult<string> {
  const result = useSmartContractReadCall(contract, "name");
  return [result.data?.[0], [result]];
}
