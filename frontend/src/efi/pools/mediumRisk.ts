import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";
import { t } from "ttag";

const ELF_STRATEGY_MEDIUM_RISK = "ELF_STRATEGY_MEDIUM_RISK";

/**
 * A medium-risk strategy made up of stablecoins and others.
 */
export const ElfStrategyMediumRisk: Strategy<CryptoSymbol.ETH> = {
  id: ELF_STRATEGY_MEDIUM_RISK,
  stakingAsset: CryptoSymbol.ETH,
  name: t`Medium Risk Strategy`,
  heldAssets: [
    CryptoSymbol.YDAI,
    CryptoSymbol.YTUSD,
    CryptoSymbol.YUSDC,
    CryptoSymbol.YUSDT,
  ],
  strategyAsset: CryptoSymbol.ELF_MEDIUM_RISK_POOL_TOKEN,
  apy: 5.34,
};
