import { ERC20 } from "elf-contracts/types/ERC20";

import { getQueryData } from "efi-ui/base/queryResults";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";

interface ParsedTokens {
  baseAssetContract: ERC20 | undefined;
  baseAssetIndex: number;
  termAssetContract: ERC20 | undefined;
  termAssetIndex: number;
}

/**
 * Returns the contracts of the base and term assets for a given pool.  also returns the assets indicies of
 * the alphanumeric sorted list of addresses.
 * @param pool
 * @returns
 */
export function useParseSortedTokensForPool(
  pool: PoolContract | undefined
): ParsedTokens {
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];

  const parsedTokens = parseSortedTokensForPool(tokenAddresses);

  return parsedTokens;
}
