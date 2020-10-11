/*
 * See https://chainid.network/
 */
export enum ChainIds {
  MAINNET = 1,
  KOVAN = 42,
}

export enum ChainNames {
  MAINNET = "Ethereum Mainnet",
  KOVAN = "Ethereum Testnet Kovan",
}

export enum NetworkIds {
  MAINNET = 1,
  KOVAN = 42,
}

export enum NetworkNames {
  MAINNET = "mainnet",
  KOVAN = "kovan",
}

export const DEFAULT_CHAIN_IDS = [ChainIds.MAINNET, ChainIds.KOVAN];
