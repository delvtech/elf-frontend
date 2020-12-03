import { TokenSymbol } from "efi/crypto/tokenAddresses";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { useERC20BalanceOf } from "efi/ui/wallets/hooks/useERC20BalanceOf";
import { useERC20Decimals } from "efi/ui/wallets/hooks/useERC20Decimals";

/**
 * Gets the ERC20 token balance for the prodvided account address and the number of decimals.
 *
 * @param {SupportedERC20StakingAssets} name 'name of ERC20 token to get a user's balance of'
 * @param {string} account {string} 'user's account address.
 */
export function useERC20BalanceInfo(
  name: TokenSymbol,
  account: string | null | undefined
): TokenBalance | undefined {
  const value = useERC20BalanceOf("WETH", account);
  const decimals = useERC20Decimals("WETH");

  if (value && decimals) {
    return {
      value,
      decimals,
    };
  }

  return undefined;
}
