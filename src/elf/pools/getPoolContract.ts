import { principalPoolContractsByAddress } from "elf/pools/ccpool";
import { PoolContract } from "elf/pools/PoolContract";
import { yieldPoolContractsByAddress } from "elf/pools/weightedPool";

export function getPoolContract(poolAddress: string | undefined): PoolContract {
  return (
    principalPoolContractsByAddress[poolAddress as string] ??
    yieldPoolContractsByAddress[poolAddress as string]
  );
}
