import { FC, SVGProps } from "react";

import daiLogo from "efi-static-assets/logos/DAI-logo.png";
import efiLogo from "efi-static-assets/logos/efi-logo.svg";
import ethLogo from "efi-static-assets/logos/ETH-logo.png";
import { ReactComponent as UsdcIcon } from "efi-static-assets/logos/svg/USDC.svg";
import { ReactComponent as WethIcon } from "efi-static-assets/logos/svg/WETH.svg";
import tusdLogo from "efi-static-assets/logos/TUSD-logo.png";
import usdcLogo from "efi-static-assets/logos/USDC-logo.png";
import usdtLogo from "efi-static-assets/logos/USDT-logo.png";
import wethLogo from "efi-static-assets/logos/WETH-logo.png";
import yfiLogo from "efi-static-assets/logos/YFI-logo.png";
import { EthIcon } from "efi-ui/ethereum/EthIcon";
import { CryptoSymbol, CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

export type AssetIcon = FC<
  SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;

/**
 * Lookup object to get the svg icon for a given symbol. NOTE: all keys are in
 * uppercase, so consumers might need to format in order to get the correct
 * icon.
 */
export const CryptoIconSvg: Record<CryptoSymbol, AssetIcon> = {
  ETH: EthIcon,
  USDC: UsdcIcon,
  WETH: WethIcon,
};

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
  "ELF-L": efiLogo,
  "ELF-M": efiLogo,
  "ELF-H": efiLogo,
};
