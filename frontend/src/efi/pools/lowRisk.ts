import { CryptoName } from "efi/crypto/crypto";
import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_LOW_RISK = "ELF_STRATEGY_LOW_RISK";

/**
 * A low-risk strategy made up of stablecoins.
 */
export const ElfStrategyLowRiskAlpha: Strategy<CryptoName.ETHER> = {
  id: ELF_STRATEGY_LOW_RISK,
  stakingAsset: CryptoName.ETHER,
  heldAssets: [
    CryptoName.YDAI,
    CryptoName.YTUSD,
    CryptoName.YUSDCOIN,
    CryptoName.YUSDT,
  ],
  strategyAsset: CryptoName.ELF_LOW_RISK_FUND_TOKEN,
};
