import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import { useTokenBalanceOf } from "efi/ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi/ui/token/hooks/useTokenDecimals";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalance(
  name: TokenContractSymbols,
  account: string | null | undefined
): TokenBalance | undefined {
  const value = useTokenBalanceOf(name, account);
  const decimals = useTokenDecimals(name);

  if (value && decimals) {
    return {
      value,
      decimals,
    };
  }

  return undefined;
}
