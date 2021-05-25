import { ERC20 } from "elf-contracts/types/ERC20";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import zip from "lodash.zip";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import {
  getCalcSwap,
  getTokenReserves,
} from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useQueryBatchSwapMulti } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwapMulti";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedTokenMulti } from "efi-ui/pools/usePoolPairedToken/usePoolPairedTokenMulti";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { getPoolTokenInfoFromContract } from "efi/pools/getPoolInfo";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { isConvergentCurvePool, PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";

/**
 * Lazy spot price technique until we get a better method.  Right now just calculates how much out
 * asset for '1' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
 * to minimize slippage in the value.
 *
 * NOTE: When using this with a tranche pool, pass the base asset as the underlying token.
 * returns spotPrice = yield / base, therefore to convert between base and yield assets:
 *
 * base = yield * spotPrice
 * yield = base / spotPrice
 */
export function usePoolSpotPrice(
  poolContract: PoolContract | undefined,
  underlyingToken: ERC20 | undefined
): number | undefined {
  const amount = "0.01";
  const { data } = usePoolTokens(poolContract);
  const [tokens, balances] = data ?? [[], []];
  const poolInfo = getPoolTokenInfoFromContract(poolContract) as PoolInfo;
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const { data: totalSupplyBN } = useSmartContractReadCall(
    poolContract,
    "totalSupply",
    { enabled: isConvergentCurvePool(poolContract) }
  );
  const totalSupply = formatUnits(totalSupplyBN ?? 0, baseAssetInfo.decimals);

  const tokenInAddress =
    baseAssetInfo.address === underlyingToken?.address
      ? baseAssetInfo.address
      : termAssetInfo.address;
  const tokenOutAddress =
    baseAssetInfo.address === underlyingToken?.address
      ? termAssetInfo.address
      : baseAssetInfo.address;
  const { tokenInReserves, tokenOutReserves } = getTokenReserves(
    tokens,
    balances,
    tokenInAddress,
    tokenOutAddress,
    baseAssetInfo.decimals
  );

  const { result: [, amountOut] = [] } = getCalcSwap(
    amount,
    SwapKind.GIVEN_IN,
    poolInfo,
    tokenInAddress,
    tokenOutAddress,
    tokenInReserves,
    tokenOutReserves,
    totalSupply
  );

  // can't give a meaningful spot price until we have the decimals
  if (!amountOut) {
    return undefined;
  }

  const spotPrice = +amountOut / +formatUnits(amount, baseAssetInfo.decimals);

  return Math.abs(spotPrice);
}

export function usePoolSpotPriceMulti(
  pools: (PoolContract | undefined)[],
  baseAssetTokens: (ERC20 | undefined)[]
): (number | undefined)[] {
  const baseAssetDecimalsResult = useTokenDecimalsMulti(baseAssetTokens);
  const baseAssetDecimals = getQueriesData(baseAssetDecimalsResult);

  const principalOrYieldTokens = usePoolPairedTokenMulti(
    pools,
    baseAssetTokens
  );
  const principalOrYieldTokenDecimalsResult = useTokenDecimalsMulti(
    principalOrYieldTokens
  );
  const principalOrYieldTokenDecimals = getQueriesData(
    principalOrYieldTokenDecimalsResult
  );

  const baseAssetAmountIns = baseAssetDecimals.map((decimals) =>
    parseUnits("0.01", decimals)
  );
  const baseAssetTokenAddresses = baseAssetTokens.map(
    (token) => token?.address
  );
  const principalOrYieldTokenAddresses = principalOrYieldTokens.map(
    (token) => token?.address
  );
  const queryBatchSwapResults = useQueryBatchSwapMulti(
    SwapKind.GIVEN_IN,
    pools,
    baseAssetTokenAddresses,
    principalOrYieldTokenAddresses,
    baseAssetAmountIns
  );
  const queryBatchSwaps = getQueriesData(queryBatchSwapResults);

  const spotPrices = zip(
    baseAssetTokenAddresses,
    principalOrYieldTokenAddresses,
    queryBatchSwaps,
    baseAssetDecimals,
    principalOrYieldTokenDecimals,
    baseAssetAmountIns
  ).map(
    ([
      baseAssetAddress,
      ptOrYtAddress,
      queryBatchSwap,
      baseAssetDecimal,
      ptOrYtDecimal,
      baseAssetAmountIn,
    ]) => {
      if (!queryBatchSwap) {
        return undefined;
      }

      const { tokenOut: amountOut } = parseQueryBatchSwapResult(
        baseAssetAddress,
        ptOrYtAddress,
        queryBatchSwap
      );

      if (
        !baseAssetAmountIn ||
        !amountOut ||
        !baseAssetDecimals ||
        !ptOrYtDecimal
      ) {
        return undefined;
      }

      const spotPrice =
        +formatUnits(amountOut, ptOrYtDecimal) /
        +formatUnits(baseAssetAmountIn, baseAssetDecimal);

      return Math.abs(spotPrice);
    }
  );
  return spotPrices;
}
