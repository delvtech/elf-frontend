import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { fetchTokenBalanceOf } from "efi/crypto/fetchTokenBalanceOf";
import { TokenSymbol } from "efi/crypto/tokenAddresses";
import { TokenContractsBySymbol } from "efi/crypto/TokenContractsByName";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useERC20BalanceOf(
  name: TokenSymbol,
  account: string | null | undefined
): BigNumber | undefined {
  const balanceKey = makeERC20BalanceOfQueryKey(name, account);

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    async (key: string[], { name, account }: ERC20BalanceOfQueryVariables) => {
      const contract = TokenContractsBySymbol[name];
      if (account) {
        return fetchTokenBalanceOf(contract, account);
      }
    }
  );

  return result.data;
}

export interface ERC20BalanceOfQueryVariables {
  name: TokenSymbol;
  account: string | null | undefined;
}
export function makeERC20BalanceOfQueryKey(
  name: TokenSymbol,
  account: string | null | undefined
): QueryKey {
  return [["contract", "erc20", "balance"], { name, account }];
}
