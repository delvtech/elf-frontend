import {
  usePoolSpotPrice,
  usePoolSpotPriceMulti,
} from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
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
  // spot price will be zero while we wait for it to load, maybe change this
  // behavior in usePoolSpotPrice to return undefined instead?
  const spotPriceTokenForOneBaseAsset = usePoolSpotPrice(pool, baseAssetToken);
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

export function usePoolTokenPricesMulti(
  pools: (PoolContract | undefined)[],
  baseAssetTokens: (ERC20 | undefined)[]
): PoolTokenPrices[] {
  // spot price will be zero while we wait for it to load, maybe change this
  // behavior in usePoolSpotPrice to return undefined instead?
  const spotPricesTokenForOneBaseAsset = usePoolSpotPriceMulti(
    pools,
    baseAssetTokens
  );

  const poolTokenPrices: PoolTokenPrices[] = spotPricesTokenForOneBaseAsset.map(
    (spotPrice) => {
      if (!spotPrice) {
        return {
          spotPriceBaseAssetForOneToken: undefined,
          spotPriceTokenForOneBaseAsset: undefined,
        };
      }

      const spotPriceBaseAssetForOneToken = 1 / spotPrice;

      return {
        spotPriceBaseAssetForOneToken,
        spotPriceTokenForOneBaseAsset: spotPrice,
      };
    }
  );

  return poolTokenPrices;
}
