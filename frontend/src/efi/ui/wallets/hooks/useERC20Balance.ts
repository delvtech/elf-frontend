import { QueryKey, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { ERC20ContractsByName, ERC20TokenSymbol } from "efi/crypto/erc20";
import { fetchERC20Balance } from "efi/crypto/fetchERC20Balance";
import { fetchERC20Decimals } from "efi/crypto/fetchERC20Decimals";

import { BalanceInfo } from "../../../crypto/BalanceInfo";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useERC20Balance(
  name: ERC20TokenSymbol,
  account: string | null | undefined
): BalanceInfo | undefined {
  const balanceKey = makeERC20BalanceQueryKey(name, account);

  const result = useQuery<[BigNumber, BigNumber] | undefined>(
    balanceKey,
    async (key: string[], { name, account }: ERC20BalanceQueryVariables) => {
      const contract = ERC20ContractsByName[name];
      if (account) {
        return Promise.all([
          fetchERC20Balance(contract, account),
          fetchERC20Decimals(contract),
        ]);
      }
    }
  );

  if (result.data) {
    const [balance, decimals] = result.data;
    return { value: balance, decimals };
  }

  return undefined;
}

export interface ERC20BalanceQueryVariables {
  name: ERC20TokenSymbol;
  account: string | null | undefined;
}
export function makeERC20BalanceQueryKey(
  name: ERC20TokenSymbol,
  account: string | null | undefined
): QueryKey {
  return [["contract", "erc20", "balance"], { name, account }];
}
