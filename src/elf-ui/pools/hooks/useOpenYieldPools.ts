import { YieldPoolTokenInfo } from "tokenlists/types";

import { useNowMs } from "elf-ui/base/hooks/useNowMs/useNowMs";
import { yieldPools } from "elf/pools/weightedPool";

export function useOpenYieldPools(): YieldPoolTokenInfo[] {
  const nowMs = useNowMs();
  return yieldPools.filter(
    (yieldPool) => yieldPool.extensions.expiration * 1000 > nowMs
  );
}
