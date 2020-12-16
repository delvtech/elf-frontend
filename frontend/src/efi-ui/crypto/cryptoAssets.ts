import daiLogo from "efi-static-assets/logos/DAI-logo.png";
import ethLogo from "efi-static-assets/logos/ETH-logo.png";
import yfiLogo from "efi-static-assets/logos/YFI-logo.png";
import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";
import { CryptoName } from "efi/crypto/CryptoName";

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
