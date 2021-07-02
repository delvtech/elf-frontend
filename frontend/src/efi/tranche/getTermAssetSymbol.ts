import { t } from "ttag";

import { isYieldToken } from "efi/interestToken/interestToken";
import { getTokenInfo } from "efi/tokenlists";
import { isPrincipalToken } from "efi/tranche/tranches";

interface TermAssetSymbols {
  /**
   * a short symbol like ePyvUSDC or eYyvCurve-stETH
   */
  symbol: string;

  /**
   * a longer label like 'Principal Token ETH'
   */
  label: string;
}

/**
 * @deprecated use tokenlists info for the symbol. if we need the label, then make a new fn for that
 * @param termAssetAddress
 * @param vaultSymbol
 * @returns
 */
export function getTermAssetSymbol(
  termAssetAddress: string | undefined,
  vaultSymbol: string | undefined
): TermAssetSymbols {
  // note that the principal tokens are built into the same contract as the tranches

  const tokenInfo = getTokenInfo(termAssetAddress ?? "");

  if (isPrincipalToken(tokenInfo)) {
    return {
      label: t`${vaultSymbol} Principal Token`,
      symbol: t`eP${vaultSymbol}`,
    };
  } else if (isYieldToken(tokenInfo)) {
    return {
      label: t`${vaultSymbol} Yield Token`,
      symbol: t`eY${vaultSymbol}`,
    };
  }

  // shouldn't happen
  return { symbol: "unknown", label: "unknown" };
}
