import { t } from "ttag";

import { trancheContracts } from "efi/tranche/tranches";
import { InterestTokenContracts } from "efi/interestToken/interestToken";

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
  const principalAddresses = trancheContracts.map(({ address }) => address);
  const interestTokenAddresses = InterestTokenContracts.map(
    ({ address }) => address
  );

  if (principalAddresses.includes(termAssetAddress ?? "")) {
    return {
      label: t`${baseAssetSymbol} Principal Token`,
      symbol: t`eP${baseAssetSymbol}`,
    };
  } else if (interestTokenAddresses.includes(termAssetAddress ?? "")) {
    return {
      label: t`${baseAssetSymbol} Yield Token`,
      symbol: t`eY${baseAssetSymbol}`,
    };
  }

  return {};
}
