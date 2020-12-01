import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

import { StakingAssets } from "../crypto/stakingAssets";

export interface Strategy {
  /**
   * Unique identifier for the strategy
   */
  id: string;

  /**
   * Human-readable name for the strategy
   */
  name: string;

  /**
   * The asset (usually Ether) for deposits and withdrawals from the strategy.
   */
  stakingAsset: StakingAssets;

  /**
   * The name of the token which represents the strategy.
   *  This must be different than the stakingAsset.
   */
  strategyAsset: CryptoSymbol;

  /**
   * The assets held in the strategy. This can include the StakingAsset.
   */
  heldAssets: CryptoSymbol[];
}
