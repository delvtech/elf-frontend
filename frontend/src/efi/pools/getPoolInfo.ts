import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";

import { principalPools } from "efi/pools/ccpool";
import { PoolContract } from "efi/pools/PoolContract";
import { yieldPools } from "efi/pools/weightedPool";

export function getPoolTokenInfoFromContract(
  poolContract: PoolContract | undefined
): PrincipalPoolTokenInfo | YieldPoolTokenInfo | undefined {
  const allPools = [...yieldPools, ...principalPools];

  const poolInfo = allPools.find(
    (pool) => pool.address === poolContract?.address
  );

  return poolInfo;
}

export function getPoolTokenInfo(
  address: string
): PrincipalPoolTokenInfo | YieldPoolTokenInfo {
  const allPools = [...yieldPools, ...principalPools];

  const poolInfo = allPools.find((pool) => pool.address === address);

  return poolInfo as PrincipalPoolTokenInfo | YieldPoolTokenInfo;
}
