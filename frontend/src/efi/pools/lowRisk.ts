import { t } from "ttag";

import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_LOW_RISK = "ELF_STRATEGY_LOW_RISK";

/**
 * A low-risk strategy made up of stablecoins.
 */
export const ElfStrategyLowRisk: Strategy = {
  id: ELF_STRATEGY_LOW_RISK,
  stakingAsset: "ETH",
  name: t`Low Risk Strategy`,
  heldAssets: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
  strategyAsset: "ELF-L",
};
