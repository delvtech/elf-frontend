import { t } from "ttag";

import { Pool } from "efi/pools/Pool";

const ELF_STRATEGY_HIGH_RISK = "ELF_STRATEGY_HIGH_RISK";

/**
 * A high-risk strategy made up of crazy coins.
 */
export const ElfStrategyHighRisk: Pool = {
  id: ELF_STRATEGY_HIGH_RISK,
  stakingAsset: "ETH",
  name: t`High Risk Pool`,
  heldAssets: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
  strategyAsset: "ELF-H",
};
