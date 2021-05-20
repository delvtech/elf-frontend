import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";

import { principalPools } from "efi/pools/ccpool";
import { PoolContract } from "efi/pools/PoolContract";
import { YieldPools } from "efi/pools/weightedPool";

export function getPoolInfoFromContract(
  poolContract: PoolContract | undefined
): PrincipalPoolTokenInfo | YieldPoolTokenInfo | undefined {
  const allPools = [...YieldPools, ...principalPools];

  const poolInfo = allPools.find(
    (pool) => pool.address === poolContract?.address
  );

  return poolInfo;
}

export function getPoolInfo(
  address: string
): PrincipalPoolTokenInfo | YieldPoolTokenInfo {
  const allPools = [...YieldPools, ...principalPools];

  const poolInfo = allPools.find((pool) => pool.address === address);

  return poolInfo as PrincipalPoolTokenInfo | YieldPoolTokenInfo;
}
