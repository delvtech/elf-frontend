import {
  getPoolInfoForPrincipalToken,
  isPrincipalPool,
} from "efi/pools/ccpool";
import { getPrincipalTokenInfoForPool } from "efi/pools/getPrincipalTokenInfoForPool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getPoolInfoForYieldToken } from "efi/pools/weightedPool";
import { getYieldTokenForPrincipalToken } from "efi/tranche/tranches";

export function getOppositePoolInfo(poolInfo: PoolInfo): PoolInfo | undefined {
  const principalTokenInfo = getPrincipalTokenInfoForPool(poolInfo);
  if (isPrincipalPool(poolInfo)) {
    const yieldToken = getYieldTokenForPrincipalToken(
      principalTokenInfo.address
    );
    return getPoolInfoForYieldToken(yieldToken.address);
  }

  return getPoolInfoForPrincipalToken(principalTokenInfo.address);
}
