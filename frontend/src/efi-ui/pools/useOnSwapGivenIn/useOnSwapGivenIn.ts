import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";

import { makeOnSwapGivenInCallArgs } from "./makeOnSwapGivenInCallArgs";
import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";

export function useOnSwapGivenIn(
  pool: PoolContract | undefined,
  account: string | null | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined
): QueryObserverResult<BigNumber> {
  const poolTokensResults = usePoolTokens(pool);
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);
  const latestBlockNumberResult = useLatestBlockNumber();
  const latestBlockNumber = getQueryData(latestBlockNumberResult);

  const balances = getQueryData(poolTokensResults)?.[1] || [];

  const tokenOut = usePoolPairedToken(pool, tokenIn);
  const onSwapGivenInResult = useSmartContractReadCall(pool, "onSwapGivenIn", {
    enabled: [
      poolId,
      tokenIn,
      amount,
      tokenOut,
      balances.length,
      latestBlockNumber,
    ].every((v) => !!v),
    callArgs: makeOnSwapGivenInCallArgs(
      poolId,
      account,
      tokenIn,
      amount,
      tokenOut,
      balances,
      latestBlockNumber
    ),
  });

  return onSwapGivenInResult;
}
