import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

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
): BigNumber | undefined {
  const balanceKey = makeTokenDecimalsQueryKey(name);

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    async (key: string[], { name, account }: TokenDecimalsQueryVariables) => {
      const contract = TokenContracts[name];
      if (account) {
        return fetchTokenDecimals(contract);
      }
    }
  );

  return result.data;
}

export interface TokenDecimalsQueryVariables {
  name: TokenContractSymbols;
  account: string | null | undefined;
}
export function makeTokenDecimalsQueryKey(
  name: TokenContractSymbols
): QueryKey {
  return [["contract", "erc20", "balance"], { name }];
}
