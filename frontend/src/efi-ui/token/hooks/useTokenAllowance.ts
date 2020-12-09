import { QueryKey, QueryResult, useQuery } from "react-query";

import { BigNumber } from "ethers";

import { fetchTokenAllowance } from "efi/contracts/token";
import { TokenContracts } from "efi/crypto/TokenContracts";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";

/**
 * Gets the ERC20 allowance
 *
 * @param {TokenContractSymbols} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenAllowance(
  name: TokenContractSymbols | undefined,
  ownerAddress: string | undefined | null,
  spenderAddress: string
): QueryResult<BigNumber | undefined> {
  const balanceKey = makeTokenAllowanceQueryKey(
    name,
    ownerAddress,
    spenderAddress
  );

  const result = useQuery<BigNumber | undefined>(
    balanceKey,
    (
      key: string[],
      { name, ownerAddress, spenderAddress }: TokenAllowanceQueryVariables
    ) => {
      if (!ownerAddress) {
        return;
      }
      if (!name) {
        return;
      }
      const contract = TokenContracts[name];

      return fetchTokenAllowance(contract, ownerAddress, spenderAddress);
    }
  );

  return result;
}

export interface TokenAllowanceQueryVariables {
  name: TokenContractSymbols | undefined;
  ownerAddress: string | undefined | null;
  spenderAddress: string;
}
export function makeTokenAllowanceQueryKey(
  name: TokenContractSymbols | undefined,
  ownerAddress: string | undefined | null,
  spenderAddress: string
): QueryKey {
  return [
    ["contract", name, "allowance"],
    { name, ownerAddress, spenderAddress },
  ];
}
