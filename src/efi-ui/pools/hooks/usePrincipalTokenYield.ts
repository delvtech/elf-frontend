import { PrincipalTokenInfo } from "tokenlists/types";

import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { principalPoolContractsByAddress } from "efi/pools/ccpool";
import { getPrincipalTokenInfoForPool } from "efi/pools/getPrincipalTokenInfoForPool";
import { getTokenInfo } from "efi/tokenlists/tokenlists";
import { usePoolSpotPrice } from "efi-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { PrincipalPoolTokenInfo } from "@elementfi/tokenlist";

/**
 * Returns the Fixed APR for a principal token
 */
export function usePrincipalTokenYield(
  principalTokenPoolInfo: PrincipalPoolTokenInfo
): number {
  const nowMs = useNowMs();
  const principalTokenPoolContract =
    principalPoolContractsByAddress[principalTokenPoolInfo.address];

  const principalTokenInfo = getTokenInfo<PrincipalTokenInfo>(
    principalTokenPoolInfo.extensions.bond
  );

  // get fixed yield
  const principalPrice = usePoolSpotPrice(
    principalTokenPoolContract,
    principalTokenInfo.address
  );

  const {
    extensions: { unlockTimestamp },
  } = getPrincipalTokenInfoForPool(principalTokenPoolInfo);

  let fixedAPR = 0;
  if (principalPrice) {
    const timeLeftInSeconds = unlockTimestamp - Math.round(nowMs / 1000);

    // principalPrice is the price in terms of the base asset.  Since we know the principal will be
    // equal to base at term, (1 - principalPrice) gives us the the fixed interest for the rest of
    // the term.  so we take that number and scale up to a year for APY:
    //
    // fixed apy = fixed interest * one_year / term_length
    if (timeLeftInSeconds > 0) {
      fixedAPR =
        (((1 - principalPrice) / principalPrice) * ONE_YEAR_IN_SECONDS) /
        timeLeftInSeconds;
    } else {
      fixedAPR = 0;
    }
  }

  return fixedAPR;
}
