import { assertNever } from "efi/base/assertNever";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

export enum CryptoAssetType {
  ETHEREUM = "ethereum",
  ERC20 = "erc20",
  ERC20PERMIT = "erc20permit",
}

export interface BaseCryptoAsset {
  id: string;
  type: CryptoAssetType;
}

export interface EthereumCryptoAsset extends BaseCryptoAsset {
  type: CryptoAssetType.ETHEREUM;
}

export interface Erc20CryptoAsset extends BaseCryptoAsset {
  type: CryptoAssetType.ERC20;
  tokenContract: ERC20;
}
export interface Erc20PermitCryptoAsset extends BaseCryptoAsset {
  type: CryptoAssetType.ERC20PERMIT;
  tokenContract: ERC20Permit;
}

export type CryptoAsset =
  | EthereumCryptoAsset
  | Erc20CryptoAsset
  | Erc20PermitCryptoAsset;

export function findTokenContract(
  cryptoAsset: CryptoAsset | undefined
): ERC20 | ERC20Permit | undefined {
  if (!cryptoAsset) {
    return;
  }
  const { type, tokenContract } = cryptoAsset;

  switch (type) {
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT:
      return tokenContract;
    case CryptoAssetType.ETHEREUM:
      return;
    default:
      assertNever(type);
  }
}
