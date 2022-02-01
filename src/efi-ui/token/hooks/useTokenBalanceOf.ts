import { ERC20 } from "@elementfi/core-typechain";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { BigNumber } from "ethers";
import { QueryObserverResult } from "react-query";

export function useTokenBalanceOf(
  contract: ERC20 | undefined,
  address: string | null | undefined
): QueryObserverResult<BigNumber> {
  return useSmartContractReadCall(contract, "balanceOf", {
    callArgs: [address as string], // safe to cast because `enabled` is set
    enabled: !!address,
  });
}

export function useTokenBalanceOfMulti(
  tokenContracts: (ERC20 | undefined)[],
  account: string | null | undefined
): QueryObserverResult<BigNumber>[] {
  return useSmartContractReadCalls(tokenContracts, "balanceOf", {
    callArgs: [account as string],
    enabled: !!account,
  });
}
