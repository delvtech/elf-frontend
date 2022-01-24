import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { principalTokenInfos } from "efi/tranche/tranches";

export function useOpenPrincipalTokenInfos(): PrincipalTokenInfo[] {
  const nowMs = useNowMs();
  return principalTokenInfos.filter(
    ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > nowMs
  );
}
