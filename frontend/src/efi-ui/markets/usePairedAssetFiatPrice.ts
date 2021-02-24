import { Money } from "ts-money";

import { CoinGeckoIds, getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useERC20Contract } from "efi-ui/contracts/useERC20Contract/useERC20Contract";
import { usePairedAssetPrice } from "efi-ui/markets/usePairedAssetPrice";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * Returns the price of the FYT in terms of fiat. This is based on the fiat
 * price of the given base asset.
 */
export function usePairedAssetFiatPrice(
  bPoolAddress: string | undefined,
  baseAssetAddress: string | undefined
): Money | undefined {
  // 1 ycEth = 0.1 WETH
  const { data: priceInBaseAsset } = usePairedAssetPrice(
    bPoolAddress,
    baseAssetAddress
  );

  const baseAssetContract = useERC20Contract(baseAssetAddress, jsonRpcProvider);
  const [baseAssetSymbol] = useTokenSymbol(baseAssetContract);
  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);

  const formattedPriceInBaseAsset = +formatCurrency(
    priceInBaseAsset,
    baseAssetDecimals
  );

  const baseAssetCoinGeckoId = getCoinGeckoId(baseAssetSymbol);

  // 1 WETH = 1500.23
  const { data: baseAssetCoinGeckoPrice } = useCoinGeckoPrice(
    baseAssetCoinGeckoId?.toLocaleLowerCase()
  );

  if (!priceInBaseAsset || !baseAssetCoinGeckoPrice) {
    return undefined;
  }

  // 0.1 WETH * $1500.23 = price of ycETH
  const fiatPrice = baseAssetCoinGeckoPrice.multiply(formattedPriceInBaseAsset);

  return fiatPrice;
}
