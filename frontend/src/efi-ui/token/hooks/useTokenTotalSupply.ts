import { Erc20 } from "elf-contracts/types/Erc20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { BigNumber } from "ethers";

export function useTokenTotalSupply<TContract extends Erc20>(
  contract: TContract
): ComputedQueryResult<BigNumber> {
  const result = useSmartContractReadCall(contract, "totalSupply");
  return [result.data?.[0], [result]];
}
