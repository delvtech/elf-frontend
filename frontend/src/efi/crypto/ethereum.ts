import { parseUnits } from "ethers/lib/utils";

/*
 * See https://chainid.network/
 */
export enum ChainId {
  MAINNET = 1,
  GOERLI = 5,
  LOCAL = 31337,
}

export const ChainNames: Record<ChainId, string> = {
  [ChainId.MAINNET]: "Ethereum Mainnet",
  [ChainId.GOERLI]: "Ethereum Testnet Goerli",
  [ChainId.LOCAL]: "Local development",
};

export const DEFAULT_CHAIN_IDS: ChainId[] = [
  ChainId.MAINNET,
  ChainId.GOERLI,
  ChainId.LOCAL,
];

export function isMainnet(chainId: number): boolean {
  return chainId === ChainId.MAINNET;
}

export const NUM_ETH_DECIMALS = 18;
export const ONE_ETHER = parseUnits("1", NUM_ETH_DECIMALS);

export const ETH_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
