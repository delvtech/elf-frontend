import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenSymbol } from "efi/crypto/TokenSymbol";
import { useTokenBalanceOf } from "efi/ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi/ui/token/hooks/useTokenDecimals";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useTokenBalance(
  name: TokenSymbol,
  account: string | null | undefined
): TokenBalance | undefined {
  const value = useTokenBalanceOf("WETH", account);
  const decimals = useTokenDecimals("WETH");

  if (value && decimals) {
    return {
      value,
      decimals,
    };
  }

  return undefined;
}
