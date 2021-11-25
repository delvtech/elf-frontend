import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zip from "lodash.zip";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "elf-balancer/pools";
import { getQueriesData } from "elf-ui/base/queryResults";
import { useSmartContractReadCall } from "elf-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "elf-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import {
  useTokenBalanceOf,
  useTokenBalanceOfMulti,
} from "elf-ui/token/hooks/useTokenBalanceOf";
import { PoolContract } from "elf/pools/PoolContract";

/**
 * Calculates the amount of the pool the account owns.
 */
export function useShareOfPool(
  pool: PoolContract | undefined,
  account: string | null | undefined
): number | undefined {
  const { data: lpBalanceOf } = useTokenBalanceOf(pool, account);
  const { data: totalSupply } = useSmartContractReadCall(pool, "totalSupply");

  if (!lpBalanceOf || !totalSupply) {
    return undefined;
  }

  return calculateShareOfPool(lpBalanceOf, totalSupply);
}

/**
 * Calculates the amount of each pool the account owns.
 */
export function useShareOfPoolMulti(
  pools: (PoolContract | undefined)[],
  account: string | null | undefined
): (number | undefined)[] {
  const lpBalanceOfResults = useTokenBalanceOfMulti(pools, account);
  const totalSupplyResults = useSmartContractReadCalls(pools, "totalSupply");

  const shareOfPools = zip(
    getQueriesData(lpBalanceOfResults),
    getQueriesData(totalSupplyResults)
  ).map(([lpBalanceOf, totalSupply]) => {
    if (!lpBalanceOf || !totalSupply) {
      return undefined;
    }
    return calculateShareOfPool(lpBalanceOf, totalSupply);
  });

  return shareOfPools;
}

export function calculateShareOfPool(
  lpBalanceOf: BigNumber,
  totalSupply: BigNumber
): number {
  const balanceOfNumber = +formatUnits(
    lpBalanceOf,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );
  const totalSupplyNumber = +formatUnits(
    totalSupply,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );
  const shareOfPool = balanceOfNumber / totalSupplyNumber;
  return shareOfPool;
}
