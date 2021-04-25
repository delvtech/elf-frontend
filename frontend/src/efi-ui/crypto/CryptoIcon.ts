import daiLogo from "efi-static-assets/logos/DAI-logo.png";
import ethLogo from "efi-static-assets/logos/ETH-logo.png";
import tusdLogo from "efi-static-assets/logos/TUSD-logo.png";
import usdcLogo from "efi-static-assets/logos/USDC-logo.png";
import usdtLogo from "efi-static-assets/logos/USDT-logo.png";
import wethLogo from "efi-static-assets/logos/WETH-logo.png";
import yfiLogo from "efi-static-assets/logos/YFI-logo.png";
import {
  EthIcon,
  TokenIcon,
  UsdcIcon,
  WethIcon,
} from "efi-ui/ethereum/EthIcon";
import { CryptoSymbol, CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

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

/**
 * @deprecated use CryptoIconSvg instead
 */
export const CryptoIcon: Record<CryptoSymbolOld, string> = {
  DAI: daiLogo,
  yDAI: daiLogo,
  ETH: ethLogo,
  WETH: wethLogo,
  USDC: usdcLogo,
  yETH: ethLogo,
  YFI: yfiLogo,
  yTUSD: tusdLogo,
  yUSDC: usdcLogo,
  yUSDT: usdtLogo,
};
