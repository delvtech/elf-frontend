import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "elf-balancer/pools";
import { SwapKind } from "elf-balancer/SwapKind";
import { usePoolTokens } from "elf-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { usePoolTotalSupply } from "elf-ui/pools/hooks/usePoolTotalSupply";
import { getPoolContract } from "elf/pools/getPoolContract";
import { getPoolTokens } from "elf/pools/getPoolTokens";
import { getTokenInfo } from "elf/tokenlists";
import {
  calcSwapPrincipalPool,
  PrincipalPoolCalcSwapResult,
  SwapAsset,
} from "elf/pools/calcSwapPrincipalPool";

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
