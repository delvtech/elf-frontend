import { Erc20 } from "elf-contracts/types/Erc20";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { BigNumber } from "ethers";

export function useTokenBalanceOf(
  contract: Erc20,
  address: string | null | undefined
): ComputedQueryResult<BigNumber> {
  const result = useSmartContractReadCall(contract, "balanceOf", {
    callArgs: [address as string], // safe to cast because `enabled` is set
    enabled: !!address,
  });

  return [result.data?.[0], [result]];
}
