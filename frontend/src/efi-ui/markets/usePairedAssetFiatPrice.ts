import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { usePairedAssetPrice } from "efi-ui/markets/usePairedAssetPrice";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { CoinGeckoIds } from "efi-coingecko";
import { useERC20Contract } from "efi-ui/contracts/useERC20Contract";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

/**
 * Returns the price of the FYT in terms of fiat. This is based on the fiat
 * price of the given base asset.
 *
 * Example:
 *
 * const priceOfFYTInDollars = usePairedAssetFiatPrice(FYETH_TO_WETH_MARKET_ADDRESS, WETH_ADDRESS);
 * // 1502.23
 *
 * const priceOfYCInDollars = usePairedAssetFiatPrice(YCETH_TO_WETH_MARKET_ADDRESS, WETH_ADDRESS);
 * // 12.23
 */
export function usePairedAssetFiatPrice(
  bPoolAddress: string | undefined,
  baseAssetAddress: string | undefined
) {
  // 1 ycEth = 0.1 WETH
  const { data: pairedAssetPriceInBaseAsset } = usePairedAssetPrice(
    bPoolAddress,
    baseAssetAddress
  );

  const baseAssetContract = useERC20Contract(baseAssetAddress, jsonRpcProvider);
  const [baseAssetSymbol] = useTokenSymbol(baseAssetContract);

  const baseAssetCoinGeckoId = baseAssetSymbol
    ? CoinGeckoIds[baseAssetSymbol]
    : undefined;

  // 1 WETH = $1500.23
  const { data: baseAssetCoinGeckoPrice } = useCoinGeckoPrice(
    baseAssetCoinGeckoId?.toLocaleLowerCase()
  );

  if (!pairedAssetPriceInBaseAsset || !baseAssetCoinGeckoPrice) {
    return undefined;
  }

  // 0.1 WETH * $1500.23 = price of ycETH
  const fiatPrice = pairedAssetPriceInBaseAsset
    .mul(baseAssetCoinGeckoPrice)
    .toNumber();

  return fiatPrice;
}
