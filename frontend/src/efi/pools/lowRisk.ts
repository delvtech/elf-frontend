import { t } from "ttag";

import { Pool } from "efi/pools/Pool";

const ELF_STRATEGY_LOW_RISK = "ELF_STRATEGY_LOW_RISK";

/**
 * A low-risk strategy made up of stablecoins.
 */
export const ElfStrategyLowRisk: Pool = {
  id: ELF_STRATEGY_LOW_RISK,
  stakingAsset: "ETH",
  name: t`Low Risk Pool`,
  description: t`Generate a stable yield on your ETH in a pool that implements a low risk strategy.`,
  heldAssets: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
  strategyAsset: "ELF-L",
};
