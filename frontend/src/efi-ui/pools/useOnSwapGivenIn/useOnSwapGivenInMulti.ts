import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { makeOnSwapGivenInCallArgs } from "efi-ui/pools/useOnSwapGivenIn/makeOnSwapGivenInCallArgs";
import { usePoolPairedTokenMulti } from "efi-ui/pools/usePoolPairedToken/usePoolPairedTokenMulti";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";
import { PoolContract } from "efi/pools/PoolContract";

export function useOnSwapGivenInMulti(
  pools: (PoolContract | undefined)[],
  tokensIn: (ERC20 | undefined)[],
  amounts: (BigNumber | undefined)[]
): QueryObserverResult<BigNumber>[] {
  const poolIdResults = useSmartContractReadCalls(pools, "getPoolId");
  const poolTokensResults = usePoolTokensMulti(pools);
  const tokensOut = usePoolPairedTokenMulti(pools, tokensIn);

  const poolIds = getQueriesData(poolIdResults);
  const poolTokens = getQueriesData(poolTokensResults) || [];

  const zipped = zip(
    poolIds,
    tokensIn,
    amounts,
    tokensOut,
    poolTokens.map((poolToken) => poolToken?.balances)
  );

  const onSwapGivenInArgs = zipped.map(
    ([poolId, tokenIn, amount, tokenOut, balances]) => {
      return {
        enabled: [poolId, tokenIn, amount, tokensOut, balances?.length].every(
          (v) => !!v
        ),
        callArgs: makeOnSwapGivenInCallArgs(
          poolId as string,
          tokenIn as ERC20,
          amount as BigNumber,
          tokenOut as ERC20,
          balances as BigNumber[]
        ),
      };
    }
  );

  const onSwapGivenInResults = useSmartContractReadCalls(
    pools,
    "onSwapGivenIn",
    onSwapGivenInArgs
  );

  return onSwapGivenInResults;
}
