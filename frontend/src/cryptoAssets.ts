import { CryptoAssetInfo } from "efi/base/CryptoAssetInfo";

export const EFI_SUPPORTED_CRYPTO_ASSETS: CryptoAssetInfo[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logoPath: "./assets/logos/ETH-logo.png",
  },
  {
    id: "dai",
    name: "Dai",
    symbol: "DAI",
    logoPath: "./assets/logos/DAI-logo.png",
  },
  {
    id: "yfi",
    name: "yearn.finance",
    symbol: "YFI",
    logoPath: "./assets/logos/YFI-logo.png",
  },
];
