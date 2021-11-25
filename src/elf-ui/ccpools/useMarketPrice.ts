import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { PrincipalTokenInfo } from "tokenlists/types";

import { usePoolTokenPrices } from "elf-ui/pools/hooks/usePoolTokenPrices/usePoolTokenPrices";
import { getPrincipalPoolContractForTranche } from "elf/pools/ccpool";
import { underlyingContractsByAddress } from "elf/underlying/underlying";

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
