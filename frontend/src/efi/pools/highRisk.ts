import { t } from "ttag";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";

const ELF_STRATEGY_HIGH_RISK = "ELF_STRATEGY_HIGH_RISK";

/**
 * A high-risk strategy made up of crazy coins.
 */
export const ElfStrategyHighRisk: Strategy = {
  id: ELF_STRATEGY_HIGH_RISK,
  stakingAsset: CryptoSymbol.ETH,
  name: t`High Risk Strategy`,
  heldAssets: [
    CryptoSymbol.YDAI,
    CryptoSymbol.YTUSD,
    CryptoSymbol.YUSDC,
    CryptoSymbol.YUSDT,
  ],
  strategyAsset: CryptoSymbol.ELF_HIGH_RISK_POOL_TOKEN,
  apy: 8.64,
};
