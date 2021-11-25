import { getPoolInfoForPrincipalToken, principalPools } from "elf/pools/ccpool";
import { PoolContract } from "elf/pools/PoolContract";
import { PoolInfo } from "elf/pools/PoolInfo";
import { getPoolInfoForYieldToken, yieldPools } from "elf/pools/weightedPool";

export function getPoolTokenInfoFromContract(
  poolContract: PoolContract | undefined
): PoolInfo | undefined {
  const allPools = [...yieldPools, ...principalPools];

  const poolInfo = allPools.find(
    (pool) => pool.address === poolContract?.address
  );

  return poolInfo;
}

export function getPoolInfo(address: string): PoolInfo {
  const allPools = [...yieldPools, ...principalPools];

  const poolInfo = allPools.find((pool) => pool.address === address);

  return poolInfo as PoolInfo;
}

export function getPoolInfoForToken(address: string): PoolInfo {
  const principalPool = getPoolInfoForPrincipalToken(address);
  const yieldPool = getPoolInfoForYieldToken(address);

  return principalPool ?? yieldPool;
}
