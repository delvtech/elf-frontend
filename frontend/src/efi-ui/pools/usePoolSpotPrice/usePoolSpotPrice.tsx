import { formatUnits, parseUnits } from "@ethersproject/units";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { PoolContract } from "efi/pools/PoolContract";

/**************************
 * Laxy spot price technique until we get a better method.  Right now just calculates how much out
 * asset for '1' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
 * to minimize slippage in the value.
 **************************/
export function usePoolSpotPrice(
  pool: PoolContract | undefined,
  priceOfThisToken: ERC20 | undefined
): number {
  const { data: decimals } = useSmartContractReadCall(
    priceOfThisToken,
    "decimals"
  );

  const otherToken = usePoolPairedToken(pool, priceOfThisToken);
  const { data: otherTokenDecimals } = useSmartContractReadCall(
    otherToken,
    "decimals"
  );
  const amountIn = parseUnits("1", decimals);
  const { data: amountOut = BigNumber.from(1) } = useOnSwapGivenIn(
    pool,
    otherToken,
    amountIn
  );

  // can't give a meaningful spot price until we have the decimals
  if (!decimals || !otherTokenDecimals) {
    return 0;
  }

  const yieldAssetRatio =
    +formatUnits(amountIn, decimals) /
    +formatUnits(amountOut, otherTokenDecimals);

  return yieldAssetRatio;
}
