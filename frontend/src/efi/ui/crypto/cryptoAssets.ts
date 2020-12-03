import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";
import { CryptoName } from "efi/crypto/CryptoName";
import daiLogo from "efi/ui/staticAssets/logos/DAI-logo.png";
import ethLogo from "efi/ui/staticAssets/logos/ETH-logo.png";
import yfiLogo from "efi/ui/staticAssets/logos/YFI-logo.png";

export const EFI_SUPPORTED_CRYPTO_ASSETS: CryptoAssetInfo[] = [
  {
    name: CryptoName.ETH,
    symbol: "ETH",
    logoImgSrc: ethLogo,
  },
  {
    name: CryptoName.yETH,
    symbol: "yETH",
    logoImgSrc: ethLogo,
  },
  {
    name: CryptoName.DAI,
    symbol: "DAI",
    logoImgSrc: daiLogo,
  },
  {
    name: CryptoName.yDAI,
    symbol: "yDAI",
    logoImgSrc: daiLogo,
  },
  {
    name: CryptoName.YFI,
    symbol: "YFI",
    logoImgSrc: yfiLogo,
  },
];
