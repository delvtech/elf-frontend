import { BigNumber } from "ethers";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useTokenBalanceOfOld } from "efi-ui/token/hooks/useTokenBalanceOfOld";
import { useTokenDecimalsOld } from "efi-ui/token/hooks/useTokenDecimalsOld";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {TokenContractSymbols} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalanceOld(
  name: TokenContractSymbols,
  account: string | null | undefined
): ComputedQueryResult<TokenBalance> {
  const valueResult = useTokenBalanceOfOld(name, account);
  const decimalsResult = useTokenDecimalsOld(name);
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
