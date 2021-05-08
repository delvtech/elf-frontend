import { ERC20 } from "elf-contracts/types/ERC20";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwapCalc } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { PoolContract } from "efi/pools/PoolContract";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { getQueriesData } from "efi-ui/base/queryResults";
import { usePoolPairedTokenMulti } from "efi-ui/pools/usePoolPairedToken/usePoolPairedTokenMulti";
import { useQueryBatchSwapMulti } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwapMulti";
import zip from "lodash.zip";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";

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
  pool: PoolContract | undefined,
  underlyingToken: ERC20 | undefined
): number | undefined {
  const { data: decimals } = useTokenDecimals(underlyingToken);
  const yieldToken = usePoolPairedToken(pool, underlyingToken);
  const amountIn = parseUnits("0.01", decimals);

  const [, amountOut] =
    useQueryBatchSwapCalc(
      SwapKind.GIVEN_IN,
      pool,
      underlyingToken?.address,
      yieldToken?.address,
      amountIn
    ) ?? [];

  // can't give a meaningful spot price until we have the decimals
  if (!amountOut || !decimals) {
    return undefined;
  }

  const spotPrice = +amountOut / +formatUnits(amountIn, decimals);

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
