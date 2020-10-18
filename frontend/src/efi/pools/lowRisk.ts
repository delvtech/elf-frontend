import { CryptoName } from "efi/crypto/CryptoName";
import { Strategy } from "efi/pools/strategy";
import { t } from "ttag";

const ELF_STRATEGY_LOW_RISK = "ELF_STRATEGY_LOW_RISK";

/**
 * A low-risk strategy made up of stablecoins.
 */
export const ElfStrategyLowRisk: Strategy<CryptoName.ETH> = {
  id: ELF_STRATEGY_LOW_RISK,
  stakingAsset: CryptoName.ETH,
  name: t`Low Risk Strategy`,
  heldAssets: [
    CryptoName.YDAI,
    CryptoName.YTUSD,
    CryptoName.YUSDC,
    CryptoName.YUSDT,
  ],
  strategyAsset: CryptoName.ELF_LOW_RISK_POOL_TOKEN,
};
