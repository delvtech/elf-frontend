import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { principalPools } from "efi/pools/ccpool";

/**
 * The list of all principal token pools whose pts aren't yet mature.
 */

export function useOpenPrincipalPools(): PrincipalPoolTokenInfo[] {
  const nowMs = useNowMs();
  return principalPools.filter(
    (principalPool) => principalPool.extensions.expiration * 1000 > nowMs
  );
}
