import { t } from "ttag";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_LOW_RISK = "ELF_STRATEGY_LOW_RISK";

/**
 * A low-risk strategy made up of stablecoins.
 */
export const ElfStrategyLowRisk: Strategy<CryptoSymbol.ETH> = {
  id: ELF_STRATEGY_LOW_RISK,
  stakingAsset: CryptoSymbol.ETH,
  name: t`Low Risk Strategy`,
  heldAssets: [
    CryptoSymbol.YDAI,
    CryptoSymbol.YTUSD,
    CryptoSymbol.YUSDC,
    CryptoSymbol.YUSDT,
  ],
  strategyAsset: CryptoSymbol.ELF_LOW_RISK_POOL_TOKEN,
  apy: 2.18,
};
