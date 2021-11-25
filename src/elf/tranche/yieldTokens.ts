import { getTokenInfo } from "elf/tokenlists";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";

export function getPrincipalTokenForYieldToken(
  interestTokenAddress: string
): PrincipalTokenInfo {
  const {
    extensions: { tranche },
  } = getTokenInfo<YieldTokenInfo>(interestTokenAddress);

  return getTokenInfo<PrincipalTokenInfo>(tranche);
}
