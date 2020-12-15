import { Erc20 } from "elf-contracts/types/Erc20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";

export function useTokenSymbol<TContract extends Erc20>(
  contract: TContract
): ComputedQueryResult<string> {
  const result = useSmartContractReadCall(contract, "symbol");
  return [result.data?.[0], [result]];
}
