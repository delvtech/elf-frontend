import { useMemo } from "react";
import { PrincipalTokenInfo } from "tokenlists/types";
import { getTokenInfo } from "elf/tokenlists";
import { principalTokenInfos } from "elf/tranche/tranches";
import { getIsMature } from "elf/tranche/getIsMature";
import { EMPTY_ARRAY } from "elf/base/emptyArray";

export function useOpenPrincipalTokensWithSameBaseAsset(
  principalTokenAddress: string | undefined
): PrincipalTokenInfo[] {
  return useMemo(() => {
    if (!principalTokenAddress) {
      return EMPTY_ARRAY as PrincipalTokenInfo[];
    }

    const {
      extensions: { underlying },
    } = getTokenInfo<PrincipalTokenInfo>(principalTokenAddress);

    return principalTokenInfos.filter((principalToken) => {
      const isSameUnderlying =
        principalToken.extensions.underlying === underlying;
      const isMature = getIsMature(principalToken.extensions.unlockTimestamp);
      return !isMature && isSameUnderlying;
    });
  }, [principalTokenAddress]);
}
