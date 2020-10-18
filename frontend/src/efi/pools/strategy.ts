import { CryptoName } from "efi/crypto/crypto";

export interface Strategy<PrimaryAsset extends CryptoName> {
  /**
   * Unique identifier for the strategy
   */
  id: string;

  /**
   * The asset (usually Ether) for deposits and withdrawals from the strategy.
   */
  stakingAsset: PrimaryAsset;

  /**
   * The name of the token which represents the strategy.
   *  This must be different than the primaryAsset.
   */
  strategyAsset: Exclude<CryptoName, PrimaryAsset>;

  /**
   * The assets held in the strategy. This can include the PrimaryAsset.
   */
  heldAssets: CryptoName[];
}
