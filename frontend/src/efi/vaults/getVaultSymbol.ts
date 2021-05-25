import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

// TODO: Proof of concept for now, this should be done w/ a lookup against a
// list of mainnet addresses
export function getVaultSymbol(
  baseAsset: CryptoAsset | undefined
): string | undefined {
  let vaultSymbol: string | undefined;
  if (baseAsset?.type === CryptoAssetType.ETHEREUM) {
    vaultSymbol = "yvCurve-stETH";
  } else if (baseAsset?.type === CryptoAssetType.ERC20PERMIT) {
    vaultSymbol = "yvUSDC";
  }
  return vaultSymbol;
}
