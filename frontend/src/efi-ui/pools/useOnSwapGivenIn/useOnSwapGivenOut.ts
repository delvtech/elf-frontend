import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";

import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";
import { makeOnSwapGivenOutCallArgs } from "efi-ui/pools/useOnSwapGivenIn/makeOnSwapGivenOutCallArgs";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";

export function useOnSwapGivenOut(
  pool: PoolContract | undefined,
  tokenOut: ERC20 | undefined,
  // TODO: Make this a string instead, eg: "2.1234"
  amount: BigNumber | undefined
): QueryObserverResult<BigNumber> {
  const poolTokensResults = usePoolTokens(pool);
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);
  const latestBlockNumberResult = useLatestBlockNumber();
  const tokenIn = usePoolPairedToken(pool, tokenOut);

  // TODO: get the block which holds the pool's last transaction
  const latestBlockNumber = getQueryData(latestBlockNumberResult);

  const balances = getQueryData(poolTokensResults)?.[1] || [];

  const onSwapGivenInResult = useSmartContractReadCall(pool, "onSwapGivenOut", {
    enabled: [
      poolId,
      pool?.address,
      tokenOut,
      amount,
      tokenOut,
      balances.length,
      latestBlockNumber,
    ].every((v) => !!v),
    callArgs: makeOnSwapGivenOutCallArgs(
      poolId,
      pool?.address,
      tokenIn,
      amount,
      tokenOut,
      balances,
      latestBlockNumber
    ),
  });

  return onSwapGivenInResult;
}
