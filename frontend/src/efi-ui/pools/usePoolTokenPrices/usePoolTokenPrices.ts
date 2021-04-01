import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PoolContract } from "efi/pools/PoolContract";
import { ERC20 } from "elf-contracts/types/ERC20";

interface PoolTokenPrices {
  amountOfBaseAssetForOneToken: number | undefined;
  amountOfTokenForOneBaseAsset: number | undefined;
}
export function usePoolTokenPrices(
  pool: PoolContract | undefined,
  baseAssetToken: ERC20 | undefined
): PoolTokenPrices {
  const amountOfTokenForOneBaseAsset = usePoolSpotPrice(pool, baseAssetToken);
  const amountOfBaseAssetForOneToken = 1 / amountOfTokenForOneBaseAsset;

  return {
    amountOfBaseAssetForOneToken,
    amountOfTokenForOneBaseAsset,
  };
}
