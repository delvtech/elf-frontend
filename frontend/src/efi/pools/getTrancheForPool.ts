import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { PrincipalTokenInfo } from "tokenlists/types";

import { isPrincipalPool } from "efi/pools/ccpool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { PrincipalTokenInfos } from "efi/tranche/tranches";

export function getTrancheForPool(
  poolInfo: PoolInfo,
  signerOrProvider?: Signer | Provider
): PrincipalTokenInfo {
  if (isPrincipalPool(poolInfo)) {
    const trancheAddress = poolInfo.extensions.bond;
    const trancheInfo = PrincipalTokenInfos.find(
      (info) => info.extensions.interestToken === trancheAddress
    ) as PrincipalTokenInfo;
    return trancheInfo;
  }

  const interestTokenAddress = poolInfo.extensions.interestToken;
  const trancheInfo = PrincipalTokenInfos.find(
    (info) => info.extensions.interestToken === interestTokenAddress
  ) as PrincipalTokenInfo;
  return trancheInfo;
}
