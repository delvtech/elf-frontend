import { t } from "ttag";

import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_MEDIUM_RISK = "ELF_STRATEGY_MEDIUM_RISK";

/**
 * A medium-risk strategy made up of stablecoins and others.
 */
export const ElfStrategyMediumRisk: Strategy = {
  id: ELF_STRATEGY_MEDIUM_RISK,
  stakingAsset: "ETH",
  name: t`Medium Risk Strategy`,
  heldAssets: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
  strategyAsset: "ELF-M",
};
