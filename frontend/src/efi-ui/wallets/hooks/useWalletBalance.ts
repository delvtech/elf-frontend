import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";
import { QueryObserverResult } from "react-query";

import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useTokenBalanceOld } from "efi-ui/token/hooks/useTokenBalanceOld/useTokenBalanceOld";
import { TokenBalance } from "efi/crypto/TokenBalance";

export interface WalletBalances {
  ETH: TokenBalance | undefined;
  WETH: TokenBalance | undefined;
}

export function useWalletBalances(): [
  WalletBalances,
  QueryObserverResult<unknown>[]
] {
  const { library, account } = useWeb3React<Web3Provider>();

  const ethResult = useEthBalance(library, account);
  const ethBalance = ethResult.data;

  const ethBalanceAsTokenBalance: TokenBalance | undefined = ethBalance
    ? {
        value: ethBalance,
        decimals: BigNumber.from(18),
      }
    : undefined;

  const [wethBalance, wethResults] = useTokenBalanceOld("WETH", account);

  return [
    { ETH: ethBalanceAsTokenBalance, WETH: wethBalance },
    [ethResult, ...wethResults],
  ];
}

export function makeWalletBalanceQueryKey(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  // Interpolating values into the cache key that change over time will bust the
  // cache. This is how you make useQuery side-effects depend on async state :)
  return [library && "web3Provider", "wallet", account, "balance"];
}
