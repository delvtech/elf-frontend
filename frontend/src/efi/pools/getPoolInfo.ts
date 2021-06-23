import { getPoolInfoForPrincipalToken, principalPools } from "efi/pools/ccpool";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getPoolInfoForYieldToken, yieldPools } from "efi/pools/weightedPool";

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
