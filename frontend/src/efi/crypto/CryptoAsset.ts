import { ERC20 } from "elf-contracts/types/ERC20";

export enum CryptoAssetType {
  ETHEREUM = "ethereuem",
  ERC20 = "erc20",
}

export interface BaseCryptoAsset {
  id: string;
  type: CryptoAssetType;
}

interface EthereumCryptoAsset extends BaseCryptoAsset {
  type: CryptoAssetType.ETHEREUM;
}

interface Erc20CryptoAsset extends BaseCryptoAsset {
  type: CryptoAssetType.ERC20;
  tokenContract: ERC20;
}

export type CryptoAsset = EthereumCryptoAsset | Erc20CryptoAsset;

export function findTokenContract(cryptoAsset: CryptoAsset) {
  let tokenContract: ERC20 | undefined;
  if (cryptoAsset.type === CryptoAssetType.ERC20) {
    tokenContract = cryptoAsset.tokenContract;
  }
  return tokenContract;
}
