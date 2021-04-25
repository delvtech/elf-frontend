import { EthIcon, TokenIcon, UsdcIcon, WethIcon } from "efi-ui/token/TokenIcon";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

/**
 * Lookup object to get the svg icon for a given symbol. NOTE: all keys are in
 * uppercase, so consumers might need to format in order to get the correct
 * icon.
 */
// TODO: type this better
export const CryptoIconSvg: Record<CryptoSymbol, TokenIcon> = {
  ETH: EthIcon,
  USDC: UsdcIcon,
  WETH: WethIcon,
};

export function findAssetIcon(
  symbol: string | undefined
): TokenIcon | undefined {
  if (!symbol) {
    return undefined;
  }
  const iconKey = symbol.toUpperCase() as CryptoSymbol;
  return CryptoIconSvg[iconKey];
}
