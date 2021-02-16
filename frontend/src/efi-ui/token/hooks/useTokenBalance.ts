import { ERC20 } from "elf-contracts/types/ERC20";

import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";

/**
 * Gets the token balance formatted to its proper decimals.
 *
 * Example:
 *
 * const balance = useTokenBalance(WethContract, account); // 11.23827971
 */
export function useTokenBalance(
  tokenContract: ERC20 | undefined,
  account: string | null | undefined
) {
  const [tokenBalance] = useTokenBalanceOf(tokenContract, account);
  const [tokenDecimals] = useTokenDecimals(tokenContract);

  const balance = +formatCurrency(tokenBalance, tokenDecimals);
  return balance;
}
