import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";

import { principalPools } from "efi/pools/ccpool";
import { PoolContract } from "efi/pools/PoolContract";
import { YieldPools } from "efi/pools/weightedPool";

export function getPoolInfo(
  poolContract: PoolContract | undefined
): PrincipalPoolTokenInfo | YieldPoolTokenInfo | undefined {
  const allPools = [...YieldPools, ...principalPools];

  const poolInfo = allPools.find(
    (pool) => pool.address === poolContract?.address
  );

  return poolInfo;
}
