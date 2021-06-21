import { Money } from "ts-money";

import { useTotalLiquidity } from "efi-ui/pools/PoolCharts/useTotalLiquidity";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { getPoolInfo } from "efi/pools/getPoolInfo";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolContract } from "efi/pools/PoolContract";

export function useTotalFiatLiquidityForPool(
  pool: PoolContract | undefined
): Money | undefined {
  const { currency } = useCurrencyPref();
  const poolInfo = getPoolInfo(pool?.address || "");
  const { baseAssetContract } = getPoolTokens(poolInfo);
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);

  const totalLiquidity = useTotalLiquidity(poolInfo);

  if (!baseAssetPrice) {
    return undefined;
  }
  const totalFiatLiquidity = baseAssetPrice.multiply(
    totalLiquidity,
    Math.round
  );

  return totalFiatLiquidity;
}
