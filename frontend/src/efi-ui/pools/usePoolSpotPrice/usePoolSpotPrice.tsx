import { useMemo } from "react";

import { formatUnits } from "ethers/lib/utils";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import {
  getCalcSwap,
  getTokenReserves,
} from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { SwapKind } from "efi-balancer/SwapKind";
import { getPoolTokenInfoFromContract } from "efi/pools/getPoolInfo";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";

/**
 * Lazy spot price technique until we get a better method.  Right now just calculates how much out
 * asset for '0.01' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
 * to minimize slippage in the value.
 *
 * NOTE: When using this with a tranche pool, pass the base asset as the underlying token.
 * returns spotPrice = yield / base, therefore to convert between base and yield assets:
 *
 * base = yield * spotPrice
 * yield = base / spotPrice
 */
const SPOT_PRICE_AMOUNT = "0.01";

export function usePoolSpotPrice(
  poolContract: PoolContract,
  tokenIn: string
): number | undefined {
  const { data } = usePoolTokens(poolContract);
  const [tokens, balances] = data ?? [[], []];
  const poolInfo = getPoolTokenInfoFromContract(poolContract) as PoolInfo;
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const { data: totalSupplyBN } = useSmartContractReadCall(
    poolContract,
    "totalSupply"
  );
  const totalSupply = formatUnits(
    totalSupplyBN ?? 0,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  const tokenInAddress =
    baseAssetInfo.address === tokenIn
      ? baseAssetInfo.address
      : termAssetInfo.address;
  const tokenOutAddress =
    baseAssetInfo.address === tokenIn
      ? termAssetInfo.address
      : baseAssetInfo.address;

  const { tokenInReserves, tokenOutReserves } = getTokenReserves(
    tokens,
    balances,
    tokenInAddress,
    tokenOutAddress,
    baseAssetInfo.decimals
  );

  const { result: [, amountOut] = [] } = useMemo(() => {
    const result = getCalcSwap(
      SPOT_PRICE_AMOUNT,
      SwapKind.GIVEN_IN,
      poolInfo,
      tokenInAddress,
      tokenOutAddress,
      tokenInReserves,
      tokenOutReserves,
      totalSupply
    );
    return result;
  }, [
    poolInfo,
    tokenInAddress,
    tokenInReserves,
    tokenOutAddress,
    tokenOutReserves,
    totalSupply,
  ]);

  // can't give a meaningful spot price until we have the decimals
  if (!amountOut) {
    return undefined;
  }

  const spotPrice = +amountOut / +SPOT_PRICE_AMOUNT;

  return Math.abs(spotPrice);
}
