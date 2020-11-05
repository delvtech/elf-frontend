import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import daiLogo from "efi/ui/staticAssets/logos/DAI-logo.png";
import ethLogo from "efi/ui/staticAssets/logos/ETH-logo.png";
import yfiLogo from "efi/ui/staticAssets/logos/YFI-logo.png";

export const EFI_SUPPORTED_CRYPTO_ASSETS: CryptoAssetInfo[] = [
  {
    name: CryptoName.ETH,
    symbol: CryptoSymbol.ETH,
    logoImgSrc: ethLogo,
  },
  {
    name: CryptoName.YETH,
    symbol: CryptoSymbol.YETH,
    logoImgSrc: ethLogo,
  },
  {
    name: CryptoName.DAI,
    symbol: CryptoSymbol.DAI,
    logoImgSrc: daiLogo,
  },
  {
    name: CryptoName.YDAI,
    symbol: CryptoSymbol.YDAI,
    logoImgSrc: daiLogo,
  },
  {
    name: CryptoName.YFI,
    symbol: CryptoSymbol.YFI,
    logoImgSrc: yfiLogo,
  },
];
