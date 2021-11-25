import { useMemo } from "react";

import { ConvergentCurvePool } from "elf-contracts-typechain/dist/types/ConvergentCurvePool";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "elf-balancer/pools";
import { useTokensWithBalance } from "elf-ui/token/hooks/useTokensWithBalance";
import { isDust } from "elf/coins/isDust";
import { principalPoolContracts } from "elf/pools/ccpool";

export function useConvergentCurvePoolsWithLPBalance(
  account: string | null | undefined
): ConvergentCurvePool[] {
  const allConvergentCurvePools = principalPoolContracts;
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
