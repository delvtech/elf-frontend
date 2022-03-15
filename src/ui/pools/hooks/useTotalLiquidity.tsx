import { formatUnits } from "ethers/lib/utils";
import { usePoolSpotPrice } from "ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "ui/pools/hooks/usePoolTokens/usePoolTokens";
import { getPoolContract } from "elf/pools/getPoolContract";
import { getPoolTokens } from "elf/pools/getPoolTokens";
import { PoolInfo } from "elf/pools/PoolInfo";
import { PoolContract } from "elf/pools/PoolContract";
import { TokenInfo } from "@elementfi/tokenlist";

export function useTotalLiquidity(
  poolInfo: PoolInfo | undefined
): number | undefined {
  let pool: PoolContract | undefined;
  if (poolInfo) {
    pool = getPoolContract(poolInfo.address);
  }
  const { data: [, balances] = [undefined, undefined] } = usePoolTokens(pool);

  let baseAssetInfo: TokenInfo | undefined;
  let termAssetInfo: TokenInfo | undefined;
  let baseAssetIndex: number | undefined;
  let termAssetIndex: number | undefined;
  if (poolInfo) {
    ({ baseAssetInfo, termAssetInfo, termAssetIndex, baseAssetIndex } =
      getPoolTokens(poolInfo));
  }

  const spotPrice = usePoolSpotPrice(pool, termAssetInfo?.address) ?? 0;

  if (
    !baseAssetInfo ||
    baseAssetIndex === undefined ||
    termAssetIndex === undefined ||
    !termAssetInfo
  ) {
    return undefined;
  }

  const { decimals: baseAssetDecimals } = baseAssetInfo;
  const baseBalance = +formatUnits(
    balances?.[baseAssetIndex] ?? 0,
    baseAssetDecimals
  );
  const termBalance = +formatUnits(
    balances?.[termAssetIndex] ?? 0,
    termAssetInfo.decimals
  );
  const termBalanceInBaseUnits = termBalance * spotPrice;
  const totalSupplyInBaseUnits = baseBalance + termBalanceInBaseUnits;
  return totalSupplyInBaseUnits;
}
