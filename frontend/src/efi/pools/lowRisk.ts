import { CryptoName } from "efi/crypto/CryptoName";
import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_LOW_RISK = "ELF_STRATEGY_LOW_RISK";

/**
 * A low-risk strategy made up of stablecoins.
 */
export const ElfStrategyLowRiskAlpha: Strategy<CryptoName.ETH> = {
  id: ELF_STRATEGY_LOW_RISK,
  stakingAsset: CryptoName.ETH,
  heldAssets: [
    CryptoName.YDAI,
    CryptoName.YTUSD,
    CryptoName.YUSDC,
    CryptoName.YUSDT,
  ],
  strategyAsset: CryptoName.ELF_LOW_RISK_POOL_TOKEN,
};
