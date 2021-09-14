import { useMemo } from "react";
import { PrincipalTokenInfo } from "tokenlists/types";
import { getTokenInfo } from "efi/tokenlists";
import { principalTokenInfos } from "efi/tranche/tranches";
import { getIsMature } from "efi/tranche/getIsMature";
import { EMPTY_ARRAY } from "efi/base/emptyArray";

export function usePrincipalTokensWithSameBaseAsset(
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
