import { ERC20 } from "elf-contracts/types/ERC20";
import { t } from "ttag";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

export function useTokenYield(
  baseAssetContract: ERC20 | undefined,
  pool: PoolContract | undefined,
  termAssetType: string
): number {
  // get fixed yield
  const baseAssetSymbol = useTokenSymbol(baseAssetContract);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const trancheContract = useTrancheForPool(pool);

  const { data: unlockTimestampBN } = useSmartContractReadCall(
    trancheContract,
    "unlockTimestamp"
  );
  let fixedAPY = 0;
  if (spotPrice && unlockTimestampBN) {
    const timeLeftInSeconds =
      unlockTimestampBN.toNumber() - Math.round(Date.now() / 1000);

    // spot price is how much principal tokens for 1 base token.  but we want how much base tokens for 1 principal
    // tokens so we take the inverse.  i.e. 0.9 ETH for 1 principal token.
    // base token.
    const principalPrice = 1 / spotPrice;

    // principalPrice is the price in terms of the base asset.  Since we know the principal will be
    // equal to base at term, (1 - principalPrice) gives us the the fixed interest for the rest of
    // the term.  so we take that number and scale up to a year for APY:
    //
    // fixed apy = fixed interest * one_year / term_length
    fixedAPY = ((1 - principalPrice) * ONE_YEAR_IN_SECONDS) / timeLeftInSeconds;
  }

  // the yield token apy is the same as the underlying vault, so we pull from there.
  const { data: vaultInfo } = useYearnVault(
    baseAssetSymbol ? t`yv${baseAssetSymbol}` : undefined
  );

  const variableAPY = vaultInfo?.apy?.recommended ?? 0;

  const tokenYield = termAssetType === "principal" ? fixedAPY : variableAPY;
  return tokenYield;
}
