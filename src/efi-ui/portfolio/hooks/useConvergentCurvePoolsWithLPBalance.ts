import { ConvergentCurvePool, ERC20 } from "@elementfi/core-typechain";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { isDust } from "efi/coins/isDust";
import { principalPoolContracts } from "efi/pools/ccpool";
import { useMemo } from "react";

export function useConvergentCurvePoolsWithLPBalance(
  account: string | null | undefined
): ConvergentCurvePool[] {
  const allConvergentCurvePools = principalPoolContracts;
  const poolsWithLP = useTokensWithBalance(
    account,
    allConvergentCurvePools as unknown as ERC20[]
  );
  return useMemo(
    () =>
      poolsWithLP
        .filter(
          ({ balanceOf }) => !isDust(balanceOf, BALANCER_POOL_LP_TOKEN_DECIMALS)
        )
        .map(({ token }) => token) as unknown as ConvergentCurvePool[],
    [poolsWithLP]
  );
}
