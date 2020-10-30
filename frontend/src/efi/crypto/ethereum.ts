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

export const ChainNames: Record<ChainId, ChainName> = {
  [ChainId.MAINNET]: ChainName.MAINNET,
  [ChainId.KOVAN]: ChainName.KOVAN,
  [ChainId.LOCAL]: ChainName.LOCAL,
};

export const DEFAULT_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.KOVAN,
  ChainId.LOCAL,
];
