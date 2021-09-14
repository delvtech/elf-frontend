import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { SwapKind } from "efi-balancer/SwapKind";
import { getCalcSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { usePoolTokens } from "efi-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { usePoolTotalSupply } from "efi-ui/pools/hooks/usePoolTotalSupply";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTokenInfo } from "efi/tokenlists";

export function useCalculatePrincipalTokenAmountOut(
  poolInfo: PrincipalPoolTokenInfo,
  amountIn: string
): string {
  const {
    address: poolAddress,
    extensions: { underlying: baseAssetAddress, bond: principalTokenAddress },
  } = poolInfo;

  const { baseAssetIndex, termAssetIndex: principalTokenIndex } =
    getPoolTokens(poolInfo);

  const poolContract = getPoolContract(poolAddress);

  const { data: totalSupplyBN } = usePoolTotalSupply(poolContract);
  const totalSupply = formatUnits(
    totalSupplyBN ?? 0,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  const { data: [, balances] = [] } = usePoolTokens(poolContract);
  const underlyingReservesBalanceOf = balances?.[baseAssetIndex];
  const principalReservesBalanceOf = balances?.[principalTokenIndex];

  const { decimals: baseAssetDecimals } = getTokenInfo(baseAssetAddress);
  const underlyingReserves = formatUnits(
    underlyingReservesBalanceOf ?? 0,
    baseAssetDecimals
  );
  const principalReserves = formatUnits(
    principalReservesBalanceOf ?? 0,
    baseAssetDecimals
  );

  const newAmountOutResult = getCalcSwap(
    amountIn,
    SwapKind.GIVEN_IN,
    poolInfo,
    baseAssetAddress,
    principalTokenAddress,
    underlyingReserves,
    principalReserves,
    totalSupply
  );

  const { result: [, amountOut] = ["", ""] } = newAmountOutResult;
  const amountOutBN = clipStringValueToDecimals(amountOut, baseAssetDecimals);

  return amountOutBN;
}
