/*
 * See https://chainid.network/
 */
export enum ChainId {
  MAINNET = 1,
  KOVAN = 42,
  LOCAL = 99,
}

export enum ChainName {
  MAINNET = "Ethereum Mainnet",
  KOVAN = "Ethereum Testnet Kovan",

  LOCAL = "Local development",
}

export enum NetworkId {
  MAINNET = 1,
  KOVAN = 42,
  LOCAL = 99,
}

export enum NetworkName {
  MAINNET = "mainnet",
  KOVAN = "kovan",
}

export const DEFAULT_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.KOVAN,
  ChainId.LOCAL,
];
