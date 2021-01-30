import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenTotalSupply<TContract extends ERC20>(
  contract: TContract
): ComputedQueryResult<BigNumber> {
  const result = useSmartContractReadCall(contract, "totalSupply");
  return [result.data?.[0], [result]];
}
