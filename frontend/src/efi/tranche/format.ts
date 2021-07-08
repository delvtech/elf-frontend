import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import warning from "warning";

import { formatYieldTokenShortSymbol } from "efi/interestToken/formatYieldTokenShortSymbol";
import { isYieldToken } from "efi/interestToken/interestToken";
import { isPrincipalToken } from "efi/tranche/tranches";

export function formatPrincipalTokenShortSymbol(
  principalToken: PrincipalTokenInfo
): string {
  const { symbol } = principalToken;
  // symbols look like: ePyvCurveLUSD-12SEP21
  const [elementSymbol] = symbol.split("-");
  return elementSymbol;
}

export function formatTermAssetShortSymbol(
  termTokenInfo: PrincipalTokenInfo | YieldTokenInfo
): string {
  // note that the principal tokens are built into the same contract as the tranches

  if (isPrincipalToken(termTokenInfo)) {
    return formatPrincipalTokenShortSymbol(termTokenInfo);
  }

  if (isYieldToken(termTokenInfo)) {
    return formatYieldTokenShortSymbol(termTokenInfo);
  }

  // shouldn't happen
  warning(
    true,
    "tried to get the short symbol on a token that is not a principal or yield token."
  );
  return "";
}
