import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";
import { makeOnSwapGivenInCallArgs } from "efi-ui/pools/useOnSwapGivenIn/makeOnSwapGivenInCallArgs";
import { usePoolIdMulti } from "efi-ui/pools/usePoolIdMulti";
import { usePoolPairedTokenMulti } from "efi-ui/pools/usePoolPairedToken/usePoolPairedTokenMulti";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";
import { PoolContract } from "efi/pools/PoolContract";

export function useOnSwapGivenInMulti(
  pools: (PoolContract | undefined)[],
  tokensIn: (ERC20 | undefined)[],
  amounts: (BigNumber | undefined)[]
): QueryObserverResult<BigNumber>[] {
  const poolIdResults = usePoolIdMulti(pools);
  const poolTokensResults = usePoolTokensMulti(pools);
  const tokensOut = usePoolPairedTokenMulti(pools, tokensIn);
  const { data: latestBlockNumber } = useLatestBlockNumber();

  const poolIds = getQueriesData(poolIdResults);
  const poolTokens = getQueriesData(poolTokensResults) || [];
  const poolBalances = poolTokens.map((poolToken) => poolToken?.[1]);

  const zipped = zip(
    pools,
    poolIds,
    tokensIn,
    amounts,
    tokensOut,
    poolBalances
  );

  const onSwapGivenInArgs = zipped.map(
    ([pool, poolId, tokenIn, amount, tokenOut, balances]) => {
      return {
        enabled: [
          poolId,
          tokenIn?.address,
          amount?.gt(0),
          tokenOut?.address,
          balances?.length,
        ].every((v) => !!v),
        callArgs: makeOnSwapGivenInCallArgs(
          poolId,
          pool?.address,
          tokenIn?.address,
          amount,
          tokenOut?.address,
          balances,
          latestBlockNumber
        ),
      };
    }
  );

  const onSwapGivenInResults = useSmartContractReadCalls(
    pools,
    "onSwap",
    onSwapGivenInArgs
  );

  return onSwapGivenInResults;
}
