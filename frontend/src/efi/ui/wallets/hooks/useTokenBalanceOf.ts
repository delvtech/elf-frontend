import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { fetchTokenBalanceOf } from "efi/crypto/fetchTokenBalanceOf";
import { TokenContractsBySymbol } from "efi/crypto/TokenContractsByName";
import { TokenSymbol } from "efi/crypto/TokenSymbol";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {TokenSymbol} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalanceOf(
  name: TokenSymbol,
  account: string | null | undefined
): BigNumber | undefined {
  const balanceKey = makeTokenBalanceOfQueryKey(name, account);

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    async (key: string[], { name, account }: TokenBalanceOfQueryVariables) => {
      const contract = TokenContractsBySymbol[name];
      if (account) {
        return fetchTokenBalanceOf(contract, account);
      }
    }
  );

  return result.data;
}

export interface TokenBalanceOfQueryVariables {
  name: TokenSymbol;
  account: string | null | undefined;
}
export function makeTokenBalanceOfQueryKey(
  name: TokenSymbol,
  account: string | null | undefined
): QueryKey {
  return [["contract", "erc20", "balance"], { name, account }];
}
