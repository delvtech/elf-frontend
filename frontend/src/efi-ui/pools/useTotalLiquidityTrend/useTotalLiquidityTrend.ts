import { formatUnits } from "ethers/lib/utils";

import { getQueryData } from "efi-ui/base/queryResults";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenDeltasForPool } from "efi-ui/pools/useTokenDeltasForPool/useTokenDeltasForPool";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

/**
 * Returns the amount of liquidity added or removed for each token in a time period.
 * @param pool contract of the pool to query.
 * @param fromTime time in seconds to query back to from now.
 * @returns {number} the liquidity trend as a decimal +/- percent.
 */
export function useTotalLiquidityTrend(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS
): number | undefined {
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0];
  const tokenBalances = getQueryData(poolTokensResult)?.[1];
  const tokenDeltas = useTokenDeltasForPool(pool, fromTime);
  const baseAsset = useBaseAssetForPool(pool);
  // assumes that yield asset and base asset have the same decimals
  const [tokenDecimals] = useTokenDecimals(baseAsset);
  const spotPrice = usePoolSpotPrice(pool, baseAsset);

  if (
    !tokenAddresses ||
    !tokenBalances ||
    !tokenDeltas ||
    !baseAsset ||
    !tokenDecimals ||
    !spotPrice
  ) {
    return undefined;
  }

  // balance of both tokens added up, normalized to base asset
  let overallBalance = 0;
  // delta of both tokens added up, for the given time period, normalized to base asset
  let overallDelta = 0;
  tokenAddresses.forEach((address, index) => {
    const balance = +formatUnits(tokenBalances[index], tokenDecimals);
    const delta = +formatUnits(tokenDeltas[index], tokenDecimals);
    // if base asset, just add numbers to total
    if (address === baseAsset?.address) {
      overallBalance += balance;
      overallDelta += delta;
    } else {
      // if yield asset, normalize numbers to base asset
      overallBalance += balance / spotPrice;
      overallDelta += delta / spotPrice;
    }
  });

  return overallDelta / overallBalance;
}
