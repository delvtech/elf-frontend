import { t } from "ttag";

import { Pool } from "efi/graveyard/pools/Pool";

const ELF_STRATEGY_MEDIUM_RISK = "ELF_STRATEGY_MEDIUM_RISK";

/**
 * A medium-risk strategy made up of stablecoins and others.
 */
export const ElfStrategyMediumRisk: Pool = {
  id: ELF_STRATEGY_MEDIUM_RISK,
  stakingAsset: "ETH",
  name: t`Medium Risk Pool`,
  heldAssets: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
  strategyAsset: "ELF-M",
};
