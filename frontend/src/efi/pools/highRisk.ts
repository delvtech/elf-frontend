import { t } from "ttag";

import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_HIGH_RISK = "ELF_STRATEGY_HIGH_RISK";

/**
 * A high-risk strategy made up of crazy coins.
 */
export const ElfStrategyHighRisk: Strategy = {
  id: ELF_STRATEGY_HIGH_RISK,
  stakingAsset: "ETH",
  name: t`High Risk Strategy`,
  heldAssets: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
  strategyAsset: "ELF-H",
};
