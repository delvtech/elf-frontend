import { QueryObserverResult, QueryStatus } from "react-query";

import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { SwapKind } from "efi-balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { makeQueryBatchSwapCallArgs } from "efi-ui/balancer/useQueryBatchSwap/makeQueryBatchSwapCallArgs";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import {
  calcSwapCCPoolUNSAFE,
  calcSwapInGivenOutWeightedPoolUNSAFE,
  calcSwapOutGivenInWeightedPoolUNSAFE,
} from "efi/pools/calcPoolSwap";
import { isPrincipalPool } from "efi/pools/ccpool";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { isYieldPool } from "efi/pools/weightedPool";
import { getTokenInfo } from "efi/tokenlists";

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
  pool: PoolContract,
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: BigNumber
): QueryObserverResult<BigNumber[]> {
  const balancerVault = useBalancerVault();
  const poolId = getTokenInfo<PoolInfo>(pool.address).extensions.poolId;

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

interface QueryBatchSwapCalcResults {
  result: [amountIn: string, amountOut: string] | undefined;
  // TBD
  status: QueryStatus;
}

export function getCalcSwap(
  amount: string,
  kind: SwapKind,
  poolInfo: PoolInfo,
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInReserves: string,
  tokenOutReserves: string,
  totalSupply: string
): QueryBatchSwapCalcResults {
  const { baseAssetInfo } = getPoolTokens(poolInfo);
  const { decimals, address: baseAssetAddress } = baseAssetInfo;
  // do weighted pools first since they don't need as many variables
  if (!amount || !tokenInAddress || !tokenOutAddress || !decimals) {
    return { result: undefined, status: "loading" };
  }

  if (isYieldPool(poolInfo as PoolInfo)) {
    return calcSwapYieldPool(
      amount,
      kind,
      decimals,
      tokenInReserves,
      tokenOutReserves
    );
  }

  if (!amount || !decimals) {
    return { result: undefined, status: "loading" };
  }

  const isBaseAssetIn = tokenInAddress === baseAssetAddress;

  if (isPrincipalPool(poolInfo)) {
    return calcSwapPrincipalPool(
      amount,
      kind,
      poolInfo,
      decimals,
      tokenInReserves,
      tokenOutReserves,
      totalSupply,
      // TODO: figure out why this is flipped
      !isBaseAssetIn
    );
  }

  return { result: undefined, status: "error" };
}

export function getTokenReserves(
  tokens: string[] | never[],
  balances: BigNumber[] | never[],
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  decimals: number
): { tokenInReserves: string; tokenOutReserves: string } {
  const balancesByAddress: Record<string, BigNumber | undefined> = {};
  tokens
    .filter((address): address is string => !!address)
    .forEach(
      (address, index) => (balancesByAddress[address] = balances[index])
    );
  const tokenInReserves = formatUnits(
    balancesByAddress[tokenInAddress ?? ""] ?? 0,
    decimals
  );

  const tokenOutReserves = formatUnits(
    balancesByAddress[tokenOutAddress ?? ""] ?? 0,
    decimals
  );
  return { tokenInReserves, tokenOutReserves };
}

function calcSwapYieldPool(
  amount: string,
  kind: SwapKind,
  decimals: number,
  tokenInReserves: string,
  tokenOutReserves: string
): QueryBatchSwapCalcResults {
  if (kind === SwapKind.GIVEN_IN) {
    const calcOutNumber = calcSwapOutGivenInWeightedPoolUNSAFE(
      amount,
      tokenOutReserves,
      tokenInReserves
    );
    const calcOut =
      clipStringValueToDecimals(calcOutNumber.toString(), decimals) ?? "0";

    return { result: [amount, calcOut], status: "success" };
  }

  // SwapKind.GIVEN_OUT
  const calcInNumber = calcSwapInGivenOutWeightedPoolUNSAFE(
    amount,
    tokenOutReserves,
    tokenInReserves
  );
  const calcIn =
    clipStringValueToDecimals(calcInNumber.toString(), decimals) ?? "0";

  return { result: [calcIn, amount], status: "success" };
}

function calcSwapPrincipalPool(
  amount: string,
  swapKind: SwapKind,
  poolInfo: PrincipalPoolTokenInfo,
  decimals: number,
  tokenInReserves: string,
  tokenOutReserves: string,
  totalSupply: string,
  baseAssetIn: boolean
): QueryBatchSwapCalcResults {
  const nowInSeconds = Math.round(Date.now() / 1000);
  const { extensions } = poolInfo;
  const { unitSeconds: tParamSeconds, expiration } = extensions;
  const timeRemainingSeconds = Math.max(expiration - nowInSeconds, 0);
  if (timeRemainingSeconds === 0) {
    // after maturity, values trade 1-1
    return { result: [amount, amount], status: "success" };
  }

  // always add total supply to base asset reserves
  const adjustedInReserves = baseAssetIn
    ? +tokenInReserves + +totalSupply
    : +tokenInReserves;
  const adjustedOutReserves = baseAssetIn
    ? +tokenOutReserves
    : +tokenOutReserves + +totalSupply;

  if (swapKind === SwapKind.GIVEN_IN) {
    const calcOutNumber = calcSwapCCPoolUNSAFE(
      amount, //                      xAmount,
      String(adjustedInReserves), //  xReserves,
      String(adjustedOutReserves), // yReserves,
      timeRemainingSeconds, //        timeRemainingSeconds,
      tParamSeconds, //               tParamSeconds,
      true //                         swapKind === SwapKind.GIVEN_IN (calculate output)
    );

    const calcOut =
      clipStringValueToDecimals(calcOutNumber.toString(), decimals) ?? "0";

    return { result: [amount, calcOut], status: "success" };
  }

  const calcInNumber = calcSwapCCPoolUNSAFE(
    amount, //                      xAmount,
    String(adjustedOutReserves), // xReserves,
    String(adjustedInReserves), //  yReserves,
    timeRemainingSeconds, //        timeRemainingSeconds,
    tParamSeconds, //               tParamSeconds,
    false //                        swapKind === SwapKind.GIVEN_IN (calculate output)
  );

  const calcIn =
    clipStringValueToDecimals(calcInNumber.toString(), decimals) ?? "0";
  return { result: [calcIn, amount], status: "success" };
}
