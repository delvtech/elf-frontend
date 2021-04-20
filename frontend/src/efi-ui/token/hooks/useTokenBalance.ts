import { ERC20 } from "elf-contracts/types/ERC20";
import { formatUnits } from "ethers/lib/utils";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTokenBalanceOfMulti } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";

/**
 * Gets the token balance formatted to its proper decimals.
 *
 * Example:
 *
 * const balance = useTokenBalance(WethContract, account); // 11.23827971
 * // TODO: Refactor to return number or undefined
 */
export function useTokenBalance(
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
  const { data: tokenDecimals } = useSmartContractReadCall(
    tokenContract,
    "decimals"
  );

  if (!tokenBalanceOf) {
    return 0;
  }

  const balance = +formatUnits(tokenBalanceOf, tokenDecimals);
  return balance;
}

export function useTokenBalanceMulti(
  tokenContracts: (ERC20 | undefined)[],
  account: string | null | undefined
): (number | undefined)[] {
  const balanceOfResults = useTokenBalanceOfMulti(tokenContracts, account);
  const decimalsResults = useTokenDecimalsMulti(tokenContracts);

  return zip(
    getQueriesData(balanceOfResults),
    getQueriesData(decimalsResults)
  ).map(([balanceOf, decimals]) => {
    if (!balanceOf || !decimals) {
      return undefined;
    }
    const balance = +formatUnits(balanceOf, decimals);
    return balance;
  });
}
