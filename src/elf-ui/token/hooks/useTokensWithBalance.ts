import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "elf-ui/base/queryResults";
import { getQueryCombinedStatus } from "elf-ui/query/getQueryCombinedStatus";
import { EMPTY_ARRAY } from "elf/base/emptyArray";
import { useTokenBalanceOfMulti } from "elf-ui/token/hooks/useTokenBalanceOf";

interface TokenWithBalance<TContract> {
  token: TContract;
  balanceOf: BigNumber;
}

export function useTokensWithBalance<TContract extends ERC20>(
  account: string | null | undefined,
  tokens: (TContract | undefined)[]
): TokenWithBalance<TContract>[] {
  const tokenBalanceOfResults = useTokenBalanceOfMulti(tokens, account);
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
