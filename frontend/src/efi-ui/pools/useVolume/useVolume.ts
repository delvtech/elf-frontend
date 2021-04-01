import { BigNumber } from "ethers";
import { Money } from "ts-money";

import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { PoolContract } from "efi/pools/PoolContract";

export function useVolume(pool: PoolContract | undefined): Money | undefined {
  const swaps = useSwaps(pool);
  const { currency } = useCurrencyPref();
  const baseAsset = useBaseAssetForPool(pool);
  const [baseAssetDecimals] = useTokenDecimals(baseAsset);
  const [baseAssetFiatPrice] = useTokenPrice(baseAsset, currency);

  let volume = BigNumber.from(0);

  swaps?.forEach((swap) => {
    if (!baseAsset) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [poolId, tokenIn, tokenOut, amountIn, amountOut] = swap;
    if (tokenIn === baseAsset?.address) {
      volume = volume.add(amountIn);
    }
    volume = volume.add(amountOut);
  });

  const fiatVolume = useConvertToFiat(
    baseAssetFiatPrice,
    volume,
    baseAssetDecimals
  );

  if (!baseAsset) {
    return;
  }

  return fiatVolume;
}
