import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { fetchTokenDecimals } from "efi/crypto/fetchTokenDecimals";
import { TokenContractsBySymbol } from "efi/crypto/TokenContractsByName";
import { TokenSymbol } from "efi/crypto/TokenSymbol";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useERC20Decimals(name: TokenSymbol): BigNumber | undefined {
  const balanceKey = makeERC20DecimalsQueryKey(name);

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    async (key: string[], { name, account }: ERC20DecimalsQueryVariables) => {
      const contract = TokenContractsBySymbol[name];
      if (account) {
        return fetchTokenDecimals(contract);
      }
    }
  );

  return result.data;
}

export interface ERC20DecimalsQueryVariables {
  name: TokenSymbol;
  account: string | null | undefined;
}
export function makeERC20DecimalsQueryKey(name: TokenSymbol): QueryKey {
  return [["contract", "erc20", "balance"], { name }];
}
