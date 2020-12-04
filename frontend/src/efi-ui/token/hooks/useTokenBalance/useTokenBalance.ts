import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import { BigNumber } from "ethers";
import { QueryResult } from "react-query";

export interface UseTokenBalanceResult {
  /**
   * the fractional unit value of the token.  i.e. wei
   */
  value: QueryResult<BigNumber | undefined>;

  /**
   * the number of decimal places between the fractional unit value to the basic unit value.
   */
  decimals: QueryResult<number | undefined>;
}

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalance(
  name: TokenContractSymbols,
  account: string | null | undefined
): UseTokenBalanceResult {
  const value = useTokenBalanceOf(name, account);
  const decimals = useTokenDecimals(name);

  return {
    value,
    decimals,
  };
}
