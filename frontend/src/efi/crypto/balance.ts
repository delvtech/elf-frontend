import { formatUnits } from "ethers/lib/utils";

import { TokenBalance } from "efi/crypto/TokenBalance";

export function getFormattedBalance(
  balanceInfo: TokenBalance | undefined,
  defaultValue: string = "0"
): string {
  if (!balanceInfo) {
    return defaultValue;
  }

  const { value, decimals } = balanceInfo;
  return formatUnits(value, decimals);
}
