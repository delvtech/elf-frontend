import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { UseSmartContractReadCallOptions } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { getQueryCombinedStatus } from "efi-ui/query/getQueryCombinedStatus";
import { EMPTY_ARRAY } from "efi/base/emptyArray";

interface TokenWithBalance<TContract> {
  token: TContract;
  balanceOf: BigNumber;
}

export function useTokensWithBalance<TContract extends ERC20>(
  account: string | null | undefined,
  tokens: (TContract | undefined)[]
): TokenWithBalance<TContract>[] {
  const balanceOfArgs: UseSmartContractReadCallOptions<
    ERC20 | ERC20Permit,
    "balanceOf",
    BigNumber
  >[] = tokens.map(() => ({
    callArgs: [account as string],
    enabled: !!account,
  }));

  const tokenBalanceOfResults = useSmartContractReadCalls(
    tokens,
    "balanceOf",
    balanceOfArgs
  );

  const status = getQueryCombinedStatus(tokenBalanceOfResults);

  const loadedData = zip(tokens, getQueriesData(tokenBalanceOfResults)).filter(
    (values): values is [TContract, BigNumber] =>
      values.every((value) => !!value)
  );

  if (status === "loading") {
    return EMPTY_ARRAY as { token: TContract; balanceOf: BigNumber }[];
  }

  const tokensWithBalance = loadedData
    .filter(([, balanceOf]) => balanceOf.gt(0))
    .map(([token, balanceOf]) => ({ token, balanceOf }));

  return tokensWithBalance as TokenWithBalance<TContract>[];
}
