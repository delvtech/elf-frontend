import { Money } from "ts-money";

import { useTotalLiquidity } from "efi-ui/pools/PoolCharts/useTotalLiquidity";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";

export function useTotalFiatLiquidity(poolInfo: PoolInfo): Money | undefined {
  const { currency } = useCurrencyPref();
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
