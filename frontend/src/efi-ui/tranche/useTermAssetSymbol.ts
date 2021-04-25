import { t } from "ttag";

import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { useInterestTokenContracts } from "efi-ui/interestToken/useInterestTokens/useInterestTokens";

interface TermAssetSymbols {
  /**
   * a short symbol like ptETH or ytUSDC
   */
  symbol?: string | undefined;

  /**
   * a longer label like 'Principal Token ETH'
   */
  label?: string | undefined;
}

export function useTermAssetSymbol(
  termAssetAddress: string | undefined,
  baseAssetSymbol: string | undefined
): TermAssetSymbols {
  // note that the principal tokens are built into the same contract as the tranches
  const principalContracts = useTrancheContracts();
  const yieldTokenContracts = useInterestTokenContracts();
  const principalAddresses = principalContracts.map(({ address }) => address);
  const interestTokenAddresses = yieldTokenContracts.map(
    ({ address }) => address
  );

  if (principalAddresses.includes(termAssetAddress ?? "")) {
    return {
      label: t`${baseAssetSymbol} Principal Token`,
      symbol: t`pt${baseAssetSymbol}`,
    };
  } else if (interestTokenAddresses.includes(termAssetAddress ?? "")) {
    return {
      label: t`${baseAssetSymbol} Yield Token`,
      symbol: t`yt${baseAssetSymbol}`,
    };
  }

  return {};
}
