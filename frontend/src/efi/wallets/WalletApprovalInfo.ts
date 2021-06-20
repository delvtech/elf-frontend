import { CryptoAsset } from "efi/crypto/CryptoAsset";

export interface WalletApprovalInfo {
  spenderAddress: string | null | undefined;
  ownerAddress: string | null | undefined;
  cryptoAsset: CryptoAsset | undefined;
  messageRenderer: (assetSymbol: string) => string;
}
