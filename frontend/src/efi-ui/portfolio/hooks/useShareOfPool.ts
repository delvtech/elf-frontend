import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import zip from "lodash.zip";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import {
  useTokenBalanceOf,
  useTokenBalanceOfMulti,
} from "efi-ui/token/hooks/useTokenBalanceOf";
import { PoolContract } from "efi/pools/PoolContract";

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

function calculateShareOfPool(lpBalanceOf: BigNumber, totalSupply: BigNumber) {
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
