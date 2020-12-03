import { parseUnits } from "ethers/lib/utils";

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

export const NUM_ETH_DECIMALS = 18;
export const ONE_ETHER = parseUnits("1", NUM_ETH_DECIMALS);
