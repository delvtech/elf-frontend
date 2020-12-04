import { QueryKey, QueryResult, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { fetchTokenBalanceOf } from "efi/crypto/fetchTokenBalanceOf";
import { TokenContracts } from "efi/crypto/TokenContracts";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {TokenContractSymbols} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalanceOf(
  name: TokenContractSymbols,
  account: string | null | undefined
): QueryResult<BigNumber | undefined> {
  const balanceKey = makeTokenBalanceOfQueryKey(name, account);

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    async (key: string[], { name, account }: TokenBalanceOfQueryVariables) => {
      const contract = TokenContracts[name];
      if (account) {
        return fetchTokenBalanceOf(contract, account);
      }
    }
  );

  return result;
}

export interface TokenBalanceOfQueryVariables {
  name: TokenContractSymbols;
  account: string | null | undefined;
}
export function makeTokenBalanceOfQueryKey(
  name: TokenContractSymbols,
  account: string | null | undefined
): QueryKey {
  return [["contract", name, "balanceOf"], { name, account }];
}
