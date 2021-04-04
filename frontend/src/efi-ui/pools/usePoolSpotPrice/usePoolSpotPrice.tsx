import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { PoolContract } from "efi/pools/PoolContract";
import { formatUnits, parseUnits } from "ethers/lib/utils";

/**
 * Lazy spot price technique until we get a better method.  Right now just calculates how much out
 * asset for '1' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
 * to minimize slippage in the value.
 *
 * NOTE: When using this with a tranche pool, pass the base asset as the underlying token.
 * returns ratio = yield / base, therefore to convert between base and yield assets:
 *
 * base = yield / ratio
 * yield = base * ratio
 */
export function usePoolSpotPrice(
  pool: PoolContract | undefined,
  underlyingToken: ERC20 | undefined
): number {
  const { data: decimals } = useSmartContractReadCall(
    underlyingToken,
    "decimals"
  );

  const tokenOut = usePoolPairedToken(pool, underlyingToken);
  const { data: tokenOutDecimals } = useSmartContractReadCall(
    tokenOut,
    "decimals"
  );
  const amountIn = parseUnits("0.01", decimals);
  const { data: amountOut = BigNumber.from(1) } = useOnSwapGivenIn(
    pool,
    underlyingToken,
    amountIn
  );

  // can't give a meaningful spot price until we have the decimals
  if (!decimals || !tokenOutDecimals) {
    return 0;
  }

  const yieldAssetRatio =
    +formatUnits(amountOut, tokenOutDecimals) /
    +formatUnits(amountIn, decimals);

  return yieldAssetRatio;
}
