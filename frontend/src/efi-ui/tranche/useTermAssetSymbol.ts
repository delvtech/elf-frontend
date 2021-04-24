import { t } from "ttag";

import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";

interface TermAssetSymbols {
  /**
   * a short symbol like ptETH or ytUSDC
   */
  symbol: string | undefined;

  /**
   * a longer label like 'Principal Token ETH'
   */
  label: string | undefined;
}

enum TermAssets {
  PRINCIPAL = "principal",
  YIELD = "yield",
}
export function useTermAssetSymbol(
  termAssetAddress: string | undefined,
  baseAssetSymbol: string | undefined
): TermAssetSymbols {
  // note that the principal tokens are built into the same contract as the tranches
  const principalContracts = useTrancheContracts();
  const principalAddresses = principalContracts.map(({ address }) => address);

  const termAssetTokenType = principalAddresses.includes(termAssetAddress ?? "")
    ? TermAssets.PRINCIPAL
    : TermAssets.YIELD;

  const label =
    termAssetTokenType === TermAssets.PRINCIPAL
      ? t`${baseAssetSymbol} Principal Token`
      : t`${baseAssetSymbol} Yield Token`;
  const symbol =
    termAssetTokenType === TermAssets.PRINCIPAL
      ? t`pt${baseAssetSymbol}`
      : t`yt${baseAssetSymbol}`;

  return { symbol, label };
}
