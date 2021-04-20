import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { BigNumber } from "ethers";
import { useMemo } from "react";

export function useConvergentCurvePoolsWithLPBalance(
  account: string | null | undefined
): {
  pool: ConvergentCurvePool;
  lpBalance: BigNumber;
}[] {
  const allConvergentCurvePools = useConvergentCurvePools();
  const poolsWithLP = useTokensWithBalance(account, allConvergentCurvePools);
  return useMemo(
    () =>
      poolsWithLP.map(({ balanceOf, token }) => ({
        pool: token,
        lpBalance: balanceOf,
      })),
    [poolsWithLP]
  );
}
