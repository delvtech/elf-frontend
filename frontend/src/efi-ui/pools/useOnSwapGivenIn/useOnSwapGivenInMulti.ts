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
  priceOfTheseTokens: (ERC20 | undefined)[]
): QueryObserverResult<BigNumber>[] {
  const poolIdResults = useSmartContractReadCalls(pools, "getPoolId");
  const poolTokensResults = usePoolTokensMulti(pools);
  const inTheseTokens = usePoolPairedTokenMulti(pools, priceOfTheseTokens);

  const poolIds = getQueriesData(poolIdResults);
  const poolTokens = getQueriesData(poolTokensResults) || [];

  const zipped = zip(
    poolIds,
    priceOfTheseTokens,
    inTheseTokens,
    poolTokens.map((poolToken) => poolToken?.balances)
  );

  const onSwapGivenInArgs = zipped.map(
    ([poolId, priceOfThisToken, inThisToken, balances]) => {
      return {
        enabled: [
          poolId,
          priceOfThisToken,
          inTheseTokens,
          balances?.length,
        ].every((v) => !!v),
        callArgs: makeOnSwapGivenInCallArgs(
          poolId as string,
          priceOfThisToken as ERC20,
          inThisToken as ERC20,
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
