import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

import efiLogo from "efi/ui/staticAssets/logos/efi-logo.svg";
import ethLogo from "efi/ui/staticAssets/logos/ETH-logo.png";
import daiLogo from "efi/ui/staticAssets/logos/DAI-logo.png";
import yfiLogo from "efi/ui/staticAssets/logos/YFI-logo.png";
import tusdLogo from "efi/ui/staticAssets/logos/TUSD-logo.png";
import usdcLogo from "efi/ui/staticAssets/logos/USDC-logo.png";
import usdtLogo from "efi/ui/staticAssets/logos/USDT-logo.png";

export const CryptoIcon: Record<keyof typeof CryptoSymbol, string> = {
  DAI: daiLogo,
  YDAI: daiLogo,
  ETH: ethLogo,
  YETH: ethLogo,
  YFI: yfiLogo,
  YTUSD: tusdLogo,
  YUSDC: usdcLogo,
  YUSDT: usdtLogo,
  ELF_LOW_RISK_POOL_TOKEN: efiLogo,
  ELF_MEDIUM_RISK_POOL_TOKEN: efiLogo,
  ELF_HIGH_RISK_POOL_TOKEN: efiLogo,
};
