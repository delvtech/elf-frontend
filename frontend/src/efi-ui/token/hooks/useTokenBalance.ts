import { ERC20 } from "elf-contracts/types/ERC20";

import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

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
  const { data: tokenBalanceOf } = useSmartContractReadCall(
    tokenContract,
    "balanceOf",
    {
      callArgs: [account as string], // safe to cast because `enabled` is set
      enabled: !!account,
    }
  );
  const { data: tokenDecimals } = useSmartContractReadCall(
    tokenContract,
    "decimals"
  );

  const balance = +formatCurrency(tokenBalanceOf, tokenDecimals);
  return balance;
}
