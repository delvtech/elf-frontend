import { formatUnits } from "ethers/lib/utils";

import { BalanceInfo } from "efi/crypto/BalanceInfo";

export function getFormattedBalance(
  balanceInfo: BalanceInfo | undefined
): string {
  if (!balanceInfo) {
    return "0";
  }

  const { value, decimals } = balanceInfo;
  return formatUnits(value, decimals);
}
