import { useMemo } from "react";

import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";

import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";

export function useConvergentCurvePoolsWithLPBalance(
  account: string | null | undefined
): ConvergentCurvePool[] {
  const allConvergentCurvePools = useConvergentCurvePools();
  const poolsWithLP = useTokensWithBalance(account, allConvergentCurvePools);
  return useMemo(() => poolsWithLP.map(({ token }) => token), [poolsWithLP]);
}
