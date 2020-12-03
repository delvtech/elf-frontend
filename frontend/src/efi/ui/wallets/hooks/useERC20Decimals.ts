import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { fetchERC20Decimals } from "efi/crypto/fetchERC20Decimals";
import { TokenContractsByName, TokenSymbol } from "efi/crypto/tokenAddresses";

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
      const contract = TokenContractsByName[name];
      if (account) {
        return fetchERC20Decimals(contract);
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
