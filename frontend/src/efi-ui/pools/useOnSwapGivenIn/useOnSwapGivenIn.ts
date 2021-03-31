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
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

export function useOnSwapGivenIn(
  pool: PoolContract | undefined,
  tokenIn: ERC20 | ERC20Permit | undefined,
  // TODO: Make this a string instead, eg: "2.1234"
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
      pool?.address,
      tokenIn?.address,
      amount?.gt(0),
      tokenOut?.address,
      balances.length,
      latestBlockNumber,
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
  });

  return onSwapGivenInResult;
}
