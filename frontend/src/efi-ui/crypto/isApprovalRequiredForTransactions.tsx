import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

export function isApprovalRequiredForTransactions(
  cryptoAsset: CryptoAsset
): boolean {
  if (cryptoAsset.type === CryptoAssetType.ERC20) {
    return true;
  }

  // Ethereum and ERC20-Permits don't need approval
  return false;
}
