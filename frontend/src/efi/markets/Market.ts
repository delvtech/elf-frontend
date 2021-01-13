import { Contract } from "ethers";

export interface Market {
  /**
   * address of the market contract
   */
  contractAddress: string;

  /**
   * Contract address for the tranche contract
   */
  trancheContractAddress: string;

  /**
   * Unique identifier for the market:
   * eth-fyeth-2020-6-1
   */
  id: string;

  /**
   * Human-readable name for the pool:
   * ETH - fyETH AMM
   */
  name?: string;

  /**
   * Human-readable description for the pool:
   * An automated money market to exchange ETH and fixed yield ETH.
   */
  description?: string;

  /**
   * The assets to trade in the market
   */
  assets: Contract[];

  /**
   *  The type of yield bearing asset in the market.
   */
  yieldAssetType: YieldAssetType;

  /**
   * When the locked asset is redeemable.  Value is a unix timestamp in milliseconds.
   */
  maturityDate: number | string;

  /**
   * When the trance started.  Value is a unix timestamp in milliseconds.
   */
  startDate: number | string;

  state: TrancheState;
}
export type TrancheState = "queued" | "running" | "closed";

export type YieldAssetType = "FYT" | "YC";
