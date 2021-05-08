import { QueryObserverResult } from "react-query";

import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { makeQueryBatchSwapCallArgs } from "efi-ui/balancer/useQueryBatchSwap/makeQueryBatchSwapCallArgs";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import {
  calcSwapInGivenOutCCPoolUNSAFE,
  calcSwapInGivenOutWeightedPoolUNSAFE,
  calcSwapOutGivenInCCPoolUNSAFE,
  calcSwapOutGivenInWeightedPoolUNSAFE,
} from "efi/pools/calcPoolSwap";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";

/**
 * Useful for previewing a swap in the balancer V2 vault.
 *
 * NOTE: This should *not* be used to check spot price since batch swaps can
 * incur additional fees and costs. To check spot price, use usePoolSpotPrice
 * instead.
 */
/**
 * Useful for previewing a swap in the balancer V2 vault.
 *
 * NOTE: This should *not* be used to check spot price since batch swaps can
 * incur additional fees and costs. To check spot price, use usePoolSpotPrice
 * instead.
 */
export function useQueryBatchSwap(
  kind: SwapKind,
  pool: PoolContract | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amount: BigNumber | undefined
): QueryObserverResult<BigNumber[]> {
  const balancerVault = useBalancerVault();

  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const queryBatchSwapResults = useSmartContractReadCall(
    balancerVault,
    "queryBatchSwap",
    {
      enabled: [poolId, tokenInAddress, amount?.gt(0), tokenOutAddress].every(
        (v) => !!v
      ),
      callArgs: makeQueryBatchSwapCallArgs(
        kind,
        poolId,
        tokenInAddress,
        amount,
        tokenOutAddress
      ),
    }
  );

  return queryBatchSwapResults;
}

export function useQueryBatchSwapNew(
  kind: SwapKind,
  pool: PoolContract | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amount: BigNumber | undefined
): [string, string] | undefined {
  const { data } = usePoolTokens(pool);
  const [tokens, balances] = data ?? [[], []];
  const { baseAssetContract } = parseSortedTokensForPool(tokens);
  const { data: decimals } = useTokenDecimals(baseAssetContract);

  const balancesByAddress: Record<string, BigNumber> = {};
  tokens
    .filter((address): address is string => !!address)
    .forEach(
      (address, index) => (balancesByAddress[address] = balances[index])
    );

  const isCCPool = isConvergentCurvePool(pool);
  const isWPool = isWeightedPool(pool);

  const { data: totalSupplyBN } = useSmartContractReadCall(
    pool,
    "totalSupply",
    { enabled: isCCPool }
  );
  const { data: unitSecondsBN } = useSmartContractReadCall(
    pool as ConvergentCurvePool,
    "unitSeconds",
    {
      enabled: isCCPool,
    }
  );
  const { data: expirationBN } = useSmartContractReadCall(
    pool as ConvergentCurvePool,
    "expiration",
    {
      enabled: isCCPool,
    }
  );

  // do weighted pools first since they don't need as many variables
  if (!amount || !tokenInAddress || !tokenOutAddress || !decimals) {
    return undefined;
  }
  const tokenInReserves = formatUnits(
    balancesByAddress[tokenInAddress],
    decimals
  );

  const tokenOutReserves = formatUnits(
    balancesByAddress[tokenOutAddress],
    decimals
  );

  const amountIn = formatUnits(amount, decimals);
  const amountOut = formatUnits(amount, decimals);

  if (isWPool && kind === SwapKind.GIVEN_IN) {
    const calcOutNumber = calcSwapOutGivenInWeightedPoolUNSAFE(
      amountIn,
      tokenOutReserves,
      tokenInReserves
    );
    const calcOut =
      clipStringValueToDecimals(calcOutNumber.toString(), decimals) ?? "0";

    return [amountIn, calcOut];
  }

  if (isWPool && kind === SwapKind.GIVEN_OUT) {
    const calcInNumber = calcSwapInGivenOutWeightedPoolUNSAFE(
      amountOut,
      tokenOutReserves,
      tokenInReserves
    );
    const calcIn =
      clipStringValueToDecimals(calcInNumber.toString(), decimals) ?? "0";

    return [calcIn, amountOut];
  }

  if (
    !amount ||
    !tokenInAddress ||
    !tokenOutAddress ||
    !totalSupplyBN ||
    !unitSecondsBN ||
    !expirationBN ||
    !decimals
  ) {
    return undefined;
  }

  const nowInSeconds = Math.round(Date.now() / 1000);
  const timeRemainingSeconds = expirationBN
    ? expirationBN.toNumber() - nowInSeconds
    : 0;
  const tParamSeconds = unitSecondsBN?.toNumber() ?? 1;

  const totalSupply = formatEther(totalSupplyBN);

  if (isCCPool && kind === SwapKind.GIVEN_IN) {
    const calcOutNumber = calcSwapOutGivenInCCPoolUNSAFE(
      amountIn, // xAmount,
      tokenInReserves, // xReserves,
      tokenOutReserves, // yReserves,
      totalSupply, // totalSupply,
      timeRemainingSeconds, // timeRemainingSeconds,
      tParamSeconds, // tParamSeconds,
      tokenInAddress === baseAssetContract?.address // baseAssetIn
    );

    const calcOut =
      clipStringValueToDecimals(calcOutNumber.toString(), decimals) ?? "0";

    return [amountIn, calcOut];
  }

  if (isCCPool && kind === SwapKind.GIVEN_OUT) {
    const calcInNumber = calcSwapInGivenOutCCPoolUNSAFE(
      amountOut, // xAmount,
      tokenInReserves, // xReserves,
      tokenOutReserves, // yReserves,
      totalSupply, // totalSupply,
      timeRemainingSeconds, // timeRemainingSeconds,
      tParamSeconds, // tParamSeconds,
      tokenInAddress === baseAssetContract?.address // baseAssetIn
    );

    const calcIn =
      clipStringValueToDecimals(calcInNumber.toString(), decimals) ?? "0";
    return [calcIn, amountOut];
  }
}
