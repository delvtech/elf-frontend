import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolContract } from "efi/pools/PoolContract";
import { BigNumber } from "ethers";
import { QueryObserverResult } from "react-query";

export function usePoolTotalSupply(
  poolContract: PoolContract
): QueryObserverResult<BigNumber> {
  return useSmartContractReadCall(poolContract, "totalSupply");
}
