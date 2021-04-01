import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PoolContract } from "efi/pools/PoolContract";
import { ERC20 } from "elf-contracts/types/ERC20";

interface PoolTokenPrices {
  spotPriceBaseAssetForOneToken: number | undefined;
  spotPriceTokenForOneBaseAsset: number | undefined;
}
export function usePoolTokenPrices(
  pool: PoolContract | undefined,
  baseAssetToken: ERC20 | undefined
): PoolTokenPrices {
  const spotPriceTokenForOneBaseAsset = usePoolSpotPrice(pool, baseAssetToken);
  const spotPriceBaseAssetForOneToken = 1 / spotPriceTokenForOneBaseAsset;

  return {
    spotPriceBaseAssetForOneToken,
    spotPriceTokenForOneBaseAsset,
  };
}
