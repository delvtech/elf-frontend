import { PrincipalTokenInfo } from "tokenlists/types";

import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { principalTokenInfos } from "efi/tranche/tranches";

export function useOpenPrincipalTokenInfos(): PrincipalTokenInfo[] {
  const nowMs = useNowMs();
  return principalTokenInfos.filter(
    ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > nowMs
  );
}
