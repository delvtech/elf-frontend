import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { UseSmartContractReadCallOptions } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useTokensWithBalance<TContract extends ERC20>(
  account: string | null | undefined,
  tokens: (TContract | undefined)[],
  provider?: Provider
): { token: TContract; balanceOf: BigNumber }[] {
  const balanceOfArgs: UseSmartContractReadCallOptions<
    ERC20 | ERC20Permit,
    "balanceOf"
  >[] = tokens.map(() => ({
    callArgs: [account as string],
    enabled: !!account,
  }));

  const tokenBalanceOfResults = useSmartContractReadCalls(
    tokens,
    "balanceOf",
    balanceOfArgs
  );

  const loadedData = zip(
    tokens,
    getQueriesData(tokenBalanceOfResults)
  ).filter((values): values is [TContract, BigNumber] =>
    values.every((value) => !!value)
  );

  const tokensWithBalance = loadedData
    .filter(([, balanceOf]) => balanceOf.gt(0))
    .map(([token, balanceOf]) => ({ token, balanceOf }));

  return tokensWithBalance;
}
