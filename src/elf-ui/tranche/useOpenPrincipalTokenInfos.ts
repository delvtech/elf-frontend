import { PrincipalTokenInfo } from "tokenlists/types";

import { useNowMs } from "elf-ui/base/hooks/useNowMs/useNowMs";
import { principalTokenInfos } from "elf/tranche/tranches";

export function useOpenPrincipalTokenInfos(): PrincipalTokenInfo[] {
  const nowMs = useNowMs();
  return principalTokenInfos.filter(
    ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > nowMs
  );
}
