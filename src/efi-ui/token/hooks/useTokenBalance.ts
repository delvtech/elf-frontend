import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { formatUnits } from "ethers/lib/utils";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getTokenInfo } from "efi/tokenlists";

/**
 * Gets the token balance formatted to its proper decimals.
 *
 * Example:
 *
 * const balance = useTokenBalance(WethContract, account); // 11.23827971
 * // TODO: Refactor to return number or undefined
 */
export function useTokenBalanceUNSAFE(
  tokenContract: ERC20 | undefined,
  account: string | null | undefined
): number {
  const { data: tokenBalanceOf } = useSmartContractReadCall(
    tokenContract,
    "balanceOf",
    {
      callArgs: [account as string], // safe to cast because `enabled` is set
      enabled: !!account,
    }
  );

  if (!tokenBalanceOf || !tokenContract) {
    return 0;
  }
  const { decimals } = getTokenInfo(tokenContract?.address);

  const balance = +formatUnits(tokenBalanceOf, decimals);
  return balance;
}
