import { ERC20 } from "elf-contracts/types/ERC20";

import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolTokenPrices {
  spotPriceBaseAssetForOneToken: number | undefined;
  spotPriceTokenForOneBaseAsset: number | undefined;
}
export function usePoolTokenPrices(
  pool: PoolContract,
  baseAssetToken: ERC20
): PoolTokenPrices {
  // spot price will be zero while we wait for it to load, maybe change this
  // behavior in usePoolSpotPrice to return undefined instead?
  const spotPriceTokenForOneBaseAsset = usePoolSpotPrice(
    pool,
    baseAssetToken.address
  );
  if (!spotPriceTokenForOneBaseAsset) {
    return {
      spotPriceBaseAssetForOneToken: undefined,
      spotPriceTokenForOneBaseAsset: undefined,
    };
  }

  const spotPriceBaseAssetForOneToken = 1 / spotPriceTokenForOneBaseAsset;

  return {
    spotPriceBaseAssetForOneToken,
    spotPriceTokenForOneBaseAsset,
  };
}
