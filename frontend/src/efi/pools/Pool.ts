import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

import { StakingAssets } from "../crypto/stakingAssets";

export interface Pool {
  /**
   * Unique identifier for the pool
   */
  id: string;

  /**
   * Human-readable name for the pool
   */
  name: string;

  /**
   * Human-readable description for the pool
   */
  description?: string;

  /**
   * The asset for deposits and withdrawals from the pool.
   */
  stakingAsset: StakingAssets;

  /**
   * The name of the token which represents the pool.
   *  This must be different than the stakingAsset.
   */
  strategyAsset: CryptoSymbol;

  /**
   * The assets held in the pool. This can include the StakingAsset.
   */
  heldAssets: CryptoSymbol[];
}
