import { formatUnits } from "ethers/lib/utils";

import { BalanceInfo } from "efi/crypto/BalanceInfo";

export function getFormattedBalance(
  balanceInfo: BalanceInfo | undefined,
  defaultValue: string = "0"
): string {
  if (!balanceInfo) {
    return defaultValue;
  }

  const { value, decimals } = balanceInfo;
  return formatUnits(value, decimals);
}
