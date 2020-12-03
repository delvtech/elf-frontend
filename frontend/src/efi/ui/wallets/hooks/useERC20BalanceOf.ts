import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { ERC20ContractsByName, ERC20TokenSymbol } from "efi/crypto/erc20";
import { fetchERC20BalanceOf } from "efi/crypto/fetchERC20Balance";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useERC20BalanceOf(
  name: ERC20TokenSymbol,
  account: string | null | undefined
): BigNumber | undefined {
  const balanceKey = makeERC20BalanceOfQueryKey(name, account);

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    async (key: string[], { name, account }: ERC20BalanceOfQueryVariables) => {
      const contract = ERC20ContractsByName[name];
      if (account) {
        return fetchERC20BalanceOf(contract, account);
      }
    }
  );

  return result.data;
}

export interface ERC20BalanceOfQueryVariables {
  name: ERC20TokenSymbol;
  account: string | null | undefined;
}
export function makeERC20BalanceOfQueryKey(
  name: ERC20TokenSymbol,
  account: string | null | undefined
): QueryKey {
  return [["contract", "erc20", "balance"], { name, account }];
}
