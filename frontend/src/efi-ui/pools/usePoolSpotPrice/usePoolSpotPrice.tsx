import { ERC20 } from "elf-contracts/types/ERC20";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { PoolContract } from "efi/pools/PoolContract";

/**
 * Lazy spot price technique until we get a better method.  Right now just calculates how much out
 * asset for '1' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
 * to minimize slippage in the value.
 *
 * NOTE: When using this with a tranche pool, pass the base asset as the underlying token.
 * returns spotPrice = yield / base, therefore to convert between base and yield assets:
 *
 * base = yield / spotPrice
 * yield = base * spotPrice
 */
export function usePoolSpotPrice(
  pool: PoolContract | undefined,
  underlyingToken: ERC20 | undefined
): number | undefined {
  const { data: decimals } = useSmartContractReadCall(
    underlyingToken,
    "decimals"
  );

  const yieldToken = usePoolPairedToken(pool, underlyingToken);
  const { data: tokenOutDecimals } = useSmartContractReadCall(
    yieldToken,
    "decimals"
  );
  const amountIn = parseUnits("0.01", decimals);
  const { data: batchSwaps } = useQueryBatchSwap(
    SwapKind.GIVEN_IN,
    pool,
    underlyingToken?.address,
    yieldToken?.address,
    amountIn
  );

  if (!batchSwaps) {
    return undefined;
  }

  const { tokenOut: amountOut } = parseQueryBatchSwapResult(
    underlyingToken?.address,
    yieldToken?.address,
    batchSwaps
  );

  // can't give a meaningful spot price until we have the decimals
  if (!amountOut || !decimals || !tokenOutDecimals) {
    return undefined;
  }

  const spotPrice =
    +formatUnits(amountOut, tokenOutDecimals) /
    +formatUnits(amountIn, decimals);

  return Math.abs(spotPrice);
}
