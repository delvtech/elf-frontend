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
   * The fiat sum of the assets in the market.
   */
  totalSupply?: string;

  /**
   * The assets addresses to trade in the market, should be [baseAsset, yieldAsset]
   */
  assets: MarketAsset[];

  /**
   *  The type of yield bearing asset in the market.
   */
  yieldAssetType: YieldAssetType;

  /**
   * When the locked asset is redeemable.  Value is a unix timestamp in milliseconds.
   */
  maturityDate: number;

  /**
   * When the trance started.  Value is a unix timestamp in milliseconds.
   */
  startDate: number;

  state: TrancheState;
}

export interface MarketAsset {
  name: string | undefined;
  symbol: string | undefined;
  address: string | undefined;
}
export type TrancheState = "queued" | "running" | "closed";

export type YieldAssetType = "FYT" | "YC";
