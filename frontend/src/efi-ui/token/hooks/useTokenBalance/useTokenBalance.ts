import { QueryResult } from "react-query";

import { BigNumber } from "ethers";

import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {TokenContractSymbols} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalance(
  name: TokenContractSymbols,
  account: string | null | undefined
): [
  TokenBalance | undefined,
  [QueryResult<BigNumber | undefined>, QueryResult<number | undefined>]
] {
  const valueResult = useTokenBalanceOf(name, account);
  const decimalsResult = useTokenDecimals(name);
  const value = valueResult.data;
  const decimals = decimalsResult.data;

  if (value === undefined || decimals === undefined) {
    return [undefined, [valueResult, decimalsResult]];
  }

  return [
    {
      value,
      decimals: BigNumber.from(decimals),
    },
    [valueResult, decimalsResult],
  ];
}
