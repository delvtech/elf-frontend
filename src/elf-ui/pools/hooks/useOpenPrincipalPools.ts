import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { useNowMs } from "elf-ui/base/hooks/useNowMs/useNowMs";
import { principalPools } from "elf/pools/ccpool";

/**
 * The list of all principal token pools whose pts aren't yet mature.
 */

export function useOpenPrincipalPools(): PrincipalPoolTokenInfo[] {
  const nowMs = useNowMs();
  return principalPools.filter(
    (principalPool) => principalPool.extensions.expiration * 1000 > nowMs
  );
}
