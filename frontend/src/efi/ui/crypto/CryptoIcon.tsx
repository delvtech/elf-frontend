import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import daiLogo from "efi-static-assets/logos/DAI-logo.png";
import efiLogo from "efi-static-assets/logos/efi-logo.svg";
import ethLogo from "efi-static-assets/logos/ETH-logo.png";
import tusdLogo from "efi-static-assets/logos/TUSD-logo.png";
import usdcLogo from "efi-static-assets/logos/USDC-logo.png";
import usdtLogo from "efi-static-assets/logos/USDT-logo.png";
import wethLogo from "efi-static-assets/logos/WETH-logo.png";
import yfiLogo from "efi-static-assets/logos/YFI-logo.png";

export const CryptoIcon: Record<CryptoSymbol, string> = {
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
