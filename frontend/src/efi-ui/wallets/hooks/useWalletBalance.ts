import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";

import {
  useTokenBalance,
  UseTokenBalanceResult,
} from "efi-ui/token/hooks/useTokenBalance/useTokenBalance";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";

export interface WalletBalances {
  ETH: TokenBalance | undefined;
  WETH: UseTokenBalanceResult;
}

export function useWalletBalances(): WalletBalances {
  const { library, account } = useWeb3React<Web3Provider>();

  const { data: ethBalance } = useEthBalance(library, account);
  const ethBalanceAsTokenBalance: TokenBalance | undefined = ethBalance
    ? {
        value: ethBalance,
        decimals: BigNumber.from(18),
      }
    : undefined;

  const wethBalance = useTokenBalance("WETH", account);

  return { ETH: ethBalanceAsTokenBalance, WETH: wethBalance };
}

export function makeWalletBalanceQueryKey(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  // Interpolating values into the cache key that change over time will bust the
  // cache. This is how you make useQuery side-effects depend on async state :)
  return [library && "web3Provider", "wallet", account, "balance"];
}
