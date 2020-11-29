/*
 * See https://chainid.network/
 */
export enum ChainId {
  MAINNET = 1,
  KOVAN = 42,
  LOCAL = 99,
}

export const ChainNames: Record<ChainId, string> = {
  [ChainId.MAINNET]: "Ethereum Mainnet",
  [ChainId.KOVAN]: "Ethereum Testnet Kovan",
  [ChainId.LOCAL]: "Local development",
};

export const DEFAULT_CHAIN_IDS: ChainId[] = [
  ChainId.MAINNET,
  ChainId.KOVAN,
  ChainId.LOCAL,
];
