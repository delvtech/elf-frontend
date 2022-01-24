import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";

import { usePoolTokenPrices } from "efi-ui/pools/hooks/usePoolTokenPrices/usePoolTokenPrices";
import { getPrincipalPoolContractForTranche } from "efi/pools/ccpool";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";

export function useMarketPrice(principalTokenInfo: PrincipalTokenInfo): string {
  const {
    address: principalTokenAddress,
    extensions: { underlying },
  } = principalTokenInfo;
  const poolContract = getPrincipalPoolContractForTranche(
    principalTokenAddress
  );
  const underlyingPoolTokenContract = underlyingContractsByAddress[
    underlying
  ] as ERC20;

  // TODO: Use a hook that returns a string here instead
  const { spotPriceBaseAssetForOneToken: principalTokenMarketPrice } =
    usePoolTokenPrices(poolContract, underlyingPoolTokenContract);

  if (!principalTokenMarketPrice) {
    return "0";
  }

  return `${principalTokenMarketPrice}`;
}
