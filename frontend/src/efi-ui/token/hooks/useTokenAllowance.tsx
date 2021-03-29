import { ERC20 } from "elf-contracts/types/ERC20";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { QueryObserverResult } from "react-query";
import { BigNumber } from "ethers";

export function useTokenAllowance(
  contract: ERC20 | undefined,
  owner: string | null | undefined,
  spender: string | null | undefined
): QueryObserverResult<BigNumber> {
  return useSmartContractReadCall(contract, "allowance", {
    enabled: !!owner && !!spender,
    callArgs: [owner as string, spender as string],
  });
}
