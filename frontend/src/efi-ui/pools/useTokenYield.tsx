import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import { ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { TermAssetType } from "efi/tranche/TermAssetType";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

/**
 * Returns the APY for either a principal token or a yield token
 * @param baseAssetContract
 * @param pool
 * @param termAssetType
 * @returns
 */
export function useTokenYield(
  poolInfo: PoolInfo,
  termAssetType: TermAssetType
): number {
  const pool = getPoolContract(poolInfo.address);
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  // get fixed yield
  const baseAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const principalPrice = usePoolSpotPrice(pool, termAssetInfo.address);
  const trancheInfo = getTrancheForPool(poolInfo);
  const { unlockTimestamp } = trancheInfo.extensions;

  let fixedAPY = 0;
  if (principalPrice) {
    const timeLeftInSeconds = unlockTimestamp - Math.round(Date.now() / 1000);

    // principalPrice is the price in terms of the base asset.  Since we know the principal will be
    // equal to base at term, (1 - principalPrice) gives us the the fixed interest for the rest of
    // the term.  so we take that number and scale up to a year for APY:
    //
    // fixed apy = fixed interest * one_year / term_length
    if (timeLeftInSeconds > 0) {
      fixedAPY =
        ((1 - principalPrice) * ONE_YEAR_IN_SECONDS) / timeLeftInSeconds;
    } else {
      fixedAPY = 0;
    }
  }

  // the yield token apy is the same as the underlying vault, so we pull from there.
  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: vaultInfo } = useYearnVault(vaultSymbol);

  const variableAPY = vaultInfo?.apy ? getYearnVaultAPY(vaultInfo?.apy) : 0;

  const tokenYield = termAssetType === "principal" ? fixedAPY : variableAPY;
  return tokenYield;
}
