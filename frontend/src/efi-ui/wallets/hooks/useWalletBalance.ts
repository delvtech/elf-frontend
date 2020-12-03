import { useQuery } from "react-query";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";

import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { fetchEthBalance } from "efi/crypto/fetchEthBalance";
import { StakingAssets } from "efi/crypto/stakingAssets";
import { TokenBalance } from "efi/crypto/TokenBalance";

export type WalletBalances = Record<StakingAssets, TokenBalance | undefined>;
export function useWalletBalances(): WalletBalances {
  const { library, account } = useWeb3React<Web3Provider>();

  const walletBalanceKey = makeWalletBalanceQueryKey(library, account);
  const result = useQuery(walletBalanceKey, async () => {
    if (library && account) {
      return fetchEthBalance(library, account);
    }
  });

  const ethBalance: TokenBalance | undefined = result.data
    ? {
        value: result.data,
        decimals: BigNumber.from(18),
      }
    : undefined;

  const wethBalance = useTokenBalance("WETH", account);

  return { ETH: ethBalance, WETH: wethBalance };
}

export function makeWalletBalanceQueryKey(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  // Interpolating values into the cache key that change over time will bust the
  // cache. This is how you make useQuery side-effects depend on async state :)
  return [library && "web3Provider", "wallet", account, "balance"];
}
