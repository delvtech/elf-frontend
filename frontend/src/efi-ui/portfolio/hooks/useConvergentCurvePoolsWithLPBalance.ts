import { useMemo } from "react";

import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { isDust } from "efi/coins/isDust";

export function useConvergentCurvePoolsWithLPBalance(
  account: string | null | undefined
): ConvergentCurvePool[] {
  const allConvergentCurvePools = useConvergentCurvePools();
  const poolsWithLP = useTokensWithBalance(account, allConvergentCurvePools);
  return useMemo(
    () =>
      poolsWithLP
        .filter(
          ({ balanceOf }) => !isDust(balanceOf, BALANCER_POOL_LP_TOKEN_DECIMALS)
        )
        .map(({ token }) => token),
    [poolsWithLP]
  );
}
