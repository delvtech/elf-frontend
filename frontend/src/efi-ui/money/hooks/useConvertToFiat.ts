import { BigNumber } from "ethers";
import { useMemo } from "react";

import { convertToFiatBalance } from "efi/money/convertToFiatBalance";

/**
 * Converts a cryptocurrency balance to the user's preferred fiat balance.
 */

export function useConvertToFiat(
  fiatPrice: number | undefined,
  balance: BigNumber | undefined,
  decimals: number | undefined,
  currencyCode: string
) {
  return useMemo(() => {
    if (!fiatPrice || !balance || !decimals) {
      return;
    }

    return convertToFiatBalance(fiatPrice, currencyCode, balance, decimals);
  }, [balance, currencyCode, decimals, fiatPrice]);
}
