import { YieldPoolTokenInfo } from "@elementfi/tokenlist";
import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { yieldPools } from "efi/pools/weightedPool";

export function useOpenYieldPools(): YieldPoolTokenInfo[] {
  const nowMs = useNowMs();
  return yieldPools.filter(
    (yieldPool) => yieldPool.extensions.expiration * 1000 > nowMs
  );
}
