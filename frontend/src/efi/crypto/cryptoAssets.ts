import { CryptoName } from "efi/crypto/crypto";
import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";

import ethLogo from "efi/ui/staticAssets/logos/ETH-logo.png";
import daiLogo from "efi/ui/staticAssets/logos/DAI-logo.png";
import yfiLogo from "efi/ui/staticAssets/logos/YFI-logo.png";

export const EFI_SUPPORTED_CRYPTO_ASSETS: CryptoAssetInfo[] = [
  {
    id: CryptoName.ETHER,
    name: "Ethereum",
    symbol: "ETH",
    logoImgSrc: ethLogo,
  },
  {
    id: CryptoName.YETH,
    name: "Yearn Wrapped Ethereum",
    symbol: "yETH",
    logoImgSrc: ethLogo,
  },
  {
    id: CryptoName.DAI,
    name: "Dai",
    symbol: "DAI",
    logoImgSrc: daiLogo,
  },
  {
    id: CryptoName.YDAI,
    name: "Yearn Wrapped Dai",
    symbol: "yDAI",
    logoImgSrc: daiLogo,
  },
  {
    id: CryptoName.YFI,
    name: "yearn.finance",
    symbol: "YFI",
    logoImgSrc: yfiLogo,
  },
];
