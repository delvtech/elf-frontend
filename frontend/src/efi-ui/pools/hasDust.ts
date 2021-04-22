import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";

const dustThreshold = 0.00001;

/**
 * When unstaking completely from a pool, it's nigh impossible to avoid the
 * remaining LP dust that remains due to how the apis for unstaking work. The
 * UI should avoid showing small amounts of dust, wherever balances are shown.
 */
export function hasLPDust(lpBalanceOf: BigNumber): boolean {
  const lpBalance = +(
    clipStringValueToDecimals(
      formatUnits(lpBalanceOf, BALANCER_POOL_LP_TOKEN_DECIMALS),
      // We chop off the last two decimals when checking for dust
      BALANCER_POOL_LP_TOKEN_DECIMALS - 2
    ) || 0
  );

  if (lpBalance <= dustThreshold) {
    return true;
  }

  return false;
}
