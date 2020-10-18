import { CryptoName } from "efi/crypto/crypto";
import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";

export const EFI_SUPPORTED_CRYPTO_ASSETS: CryptoAssetInfo[] = [
  {
    id: CryptoName.ETHER,
    name: "Ethereum",
    symbol: "ETH",
    logoPath: "./assets/logos/ETH-logo.png",
  },
  {
    id: CryptoName.YETH,
    name: "Yearn Wrapped Ethereum",
    symbol: "yETH",
    logoPath: "./assets/logos/ETH-logo.png",
  },
  {
    id: CryptoName.DAI,
    name: "Dai",
    symbol: "DAI",
    logoPath: "./assets/logos/DAI-logo.png",
  },
  {
    id: CryptoName.YDAI,
    name: "Yearn Wrapped Dai",
    symbol: "yDAI",
    logoPath: "./assets/logos/DAI-logo.png",
  },
  {
    id: CryptoName.YFI,
    name: "yearn.finance",
    symbol: "YFI",
    logoPath: "./assets/logos/YFI-logo.png",
  },
];
