import ContractAddresses from "efi/contracts/contractsJson";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

export function getCryptoAddress(activeBaseAsset: CryptoAsset): string {
  // Use weth tranches for when eth is the selected base asset
  let baseAssetAddress = ContractAddresses.wethAddress;
  if (activeBaseAsset.type === CryptoAssetType.ERC20) {
    baseAssetAddress = activeBaseAsset.tokenContract.address;
  }
  return baseAssetAddress;
}
