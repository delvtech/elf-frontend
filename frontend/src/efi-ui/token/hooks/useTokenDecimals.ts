import { QueryKey, QueryResult, useQuery } from "react-query";

import { fetchTokenDecimals } from "efi/crypto/fetchTokenDecimals";
import { TokenContracts } from "efi/crypto/TokenContracts";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {TokenContractSymbols} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenDecimals(
  name: TokenContractSymbols
): QueryResult<number | undefined> {
  const balanceKey = makeTokenDecimalsQueryKey(name);

  const result = useQuery<number | undefined>(
    balanceKey,
    (key: string[], { name }: TokenDecimalsQueryVariables) => {
      const contract = TokenContracts[name];
      return fetchTokenDecimals(contract);
    }
  );

  return result;
}

export interface TokenDecimalsQueryVariables {
  name: TokenContractSymbols;
}
export function makeTokenDecimalsQueryKey(
  name: TokenContractSymbols
): QueryKey {
  return [["contract", name, "decimals"], { name }];
}
