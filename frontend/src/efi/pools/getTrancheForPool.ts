import { PrincipalTokenInfo } from "tokenlists/types";

import { isPrincipalPool } from "efi/pools/ccpool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { principalTokenInfos } from "efi/tranche/tranches";

export function getTrancheForPool(poolInfo: PoolInfo): PrincipalTokenInfo {
  if (isPrincipalPool(poolInfo)) {
    const trancheAddress = poolInfo.extensions.bond;
    const trancheInfo = principalTokenInfos.find(
      (info) => info.address === trancheAddress
    ) as PrincipalTokenInfo;
    return trancheInfo;
  }

  const interestTokenAddress = poolInfo.extensions.interestToken;
  const trancheInfo = principalTokenInfos.find(
    (info) => info.extensions.interestToken === interestTokenAddress
  ) as PrincipalTokenInfo;
  return trancheInfo;
}
