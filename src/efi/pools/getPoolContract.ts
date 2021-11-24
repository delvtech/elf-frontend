import { principalPoolContractsByAddress } from "efi/pools/ccpool";
import { PoolContract } from "efi/pools/PoolContract";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";

export function getPoolContract(poolAddress: string | undefined): PoolContract {
  return (
    principalPoolContractsByAddress[poolAddress as string] ??
    yieldPoolContractsByAddress[poolAddress as string]
  );
}
