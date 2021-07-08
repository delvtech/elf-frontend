import { Money } from "ts-money";

import { useTotalLiquidity } from "efi-ui/pools/useTotalLiquidity";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";

export function useTotalFiatLiquidity(poolInfo: PoolInfo): Money | undefined {
  const { currency } = useCurrencyPref();
  const { baseAssetContract } = getPoolTokens(poolInfo);
  const { data: baseAssetPrice } = useTokenPrice(baseAssetContract, currency);

  const totalLiquidity = useTotalLiquidity(poolInfo);

  if (!baseAssetPrice) {
    return undefined;
  }

  const safeTotalLiquidity = Number.isFinite(totalLiquidity)
    ? totalLiquidity
    : 0;
  const totalFiatLiquidity = baseAssetPrice.multiply(
    safeTotalLiquidity,
    Math.round
  );

  return totalFiatLiquidity;
}
