import { CryptoAssetInfo } from "efi/base/CryptoAssetInfo";

export const EFI_SUPPORTED_CRYPTO_ASSETS: CryptoAssetInfo[] = [
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    logoPath: "./assets/logos/ETH-logo.png",
  },
  {
    id: "yeth",
    name: "Yearn Wrapped Ethereum",
    symbol: "yETH",
    logoPath: "./assets/logos/ETH-logo.png",
  },
  {
    id: "dai",
    name: "Dai",
    symbol: "DAI",
    logoPath: "./assets/logos/DAI-logo.png",
  },
  {
    id: "ydai",
    name: "Yearn Wrapped Dai",
    symbol: "yDAI",
    logoPath: "./assets/logos/DAI-logo.png",
  },
  {
    id: "yfi",
    name: "yearn.finance",
    symbol: "YFI",
    logoPath: "./assets/logos/YFI-logo.png",
  },
  {
    id: "yyfi",
    name: "Yearn Wrapped YFI",
    symbol: "yYFI",
    logoPath: "./assets/logos/YFI-logo.png",
  },
];
