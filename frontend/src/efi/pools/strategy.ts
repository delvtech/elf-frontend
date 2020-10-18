import { CryptoName } from "efi/crypto/CryptoName";

export interface Strategy<StakingAsset extends CryptoName> {
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
  stakingAsset: StakingAsset;

  /**
   * The name of the token which represents the strategy.
   *  This must be different than the stakingAsset.
   */
  strategyAsset: Exclude<CryptoName, StakingAsset>;

  /**
   * The assets held in the strategy. This can include the StakingAsset.
   */
  heldAssets: CryptoName[];
}
