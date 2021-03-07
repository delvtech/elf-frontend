import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";

import { makeOnSwapGivenInCallArgs } from "./makeOnSwapGivenInCallArgs";

export function useOnSwapGivenIn(
  pool: PoolContract | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined
): QueryObserverResult<BigNumber> {
  const poolTokensResults = usePoolTokens(pool);
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const { balances = [] } = getQueryData(poolTokensResults) || {};

  const tokenOut = usePoolPairedToken(pool, tokenIn);
  const onSwapGivenInResult = useSmartContractReadCall(pool, "onSwapGivenIn", {
    enabled: [poolId, tokenIn, amount, tokenOut, balances.length].every(
      (v) => !!v
    ),
    callArgs: makeOnSwapGivenInCallArgs(
      poolId as string,
      tokenIn as ERC20,
      amount as BigNumber,
      tokenOut as ERC20,
      balances
    ),
  });

  return onSwapGivenInResult;
}
