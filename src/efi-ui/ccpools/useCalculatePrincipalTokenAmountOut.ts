import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { SwapKind } from "efi-balancer/SwapKind";
import { usePoolTokens } from "efi-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { usePoolTotalSupply } from "efi-ui/pools/hooks/usePoolTotalSupply";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTokenInfo } from "efi/tokenlists";
import {
  calcSwapPrincipalPool,
  PrincipalPoolCalcSwapResult,
  SwapAsset,
} from "efi/pools/calcSwapPrincipalPool";

export function useCalculatePrincipalTokenAmountOut(
  poolInfo: PrincipalPoolTokenInfo,
  amountIn: string
): PrincipalPoolCalcSwapResult {
  const {
    address: poolAddress,
    extensions: { underlying: baseAssetAddress },
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

  const calcSwapResult = calcSwapPrincipalPool(
    amountIn,
    SwapKind.GIVEN_IN,
    SwapAsset.BASE_ASSET,
    poolInfo,
    baseAssetDecimals,
    underlyingReserves,
    principalReserves,
    totalSupply
  );

  return calcSwapResult;
}
