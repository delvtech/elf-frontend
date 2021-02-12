import { BigNumber } from "ethers";
import { QueryKey, QueryObserverResult, useQuery } from "react-query";

import { fetchTokenAllowance } from "efi/contracts/token";
import { TokenContracts } from "efi/graveyard/TokenContracts.1";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";

/**
 * Gets the ERC20 allowance
 *
 * @param {TokenContractSymbols} tokenSymbol name of ERC20 token to set allowance for.
 * @param {ownerAddress} {string} user's account address.
 * @param {spenderAddress} {string} who the user is authorizing to transfer money to
 */
export function useTokenAllowance(
  tokenSymbol: TokenContractSymbols | undefined,
  ownerAddress: string | undefined | null,
  spenderAddress: string
): QueryObserverResult<BigNumber | undefined> {
  const balanceKey = makeTokenAllowanceQueryKey(
    tokenSymbol,
    ownerAddress,
    spenderAddress
  );

  const result = useQuery<BigNumber | undefined>({
    queryKey: balanceKey,
    queryFn: () => {
      if (!ownerAddress) {
        return;
      }
      if (!tokenSymbol) {
        return;
      }
      const contract = TokenContracts[tokenSymbol];

      return fetchTokenAllowance(contract, ownerAddress, spenderAddress);
    },
  });

  return result;
}

export function makeTokenAllowanceQueryKey(
  tokenSymbol: TokenContractSymbols | undefined,
  ownerAddress: string | undefined | null,
  spenderAddress: string
): QueryKey {
  return [
    ["contract", tokenSymbol, "allowance"],
    { tokenSymbol, ownerAddress, spenderAddress },
  ];
}
