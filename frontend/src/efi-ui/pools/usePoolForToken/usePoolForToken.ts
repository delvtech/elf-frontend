import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useAllPools } from "efi-ui/pools/useAllPools/useAllPools";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";
import { PoolContract } from "efi/pools/PoolContract";

/**
 * @deprecated hooks based lookups for pools are deprecated. use a getter instead
 */
export function usePoolForToken(
  tokenContract: ERC20 | undefined,
  signerOrProvider?: Signer | Provider
): PoolContract | undefined {
  const allPools = useAllPools(signerOrProvider);

  const poolTokensResults = usePoolTokensMulti(allPools);

  const poolTokens = getQueriesData(poolTokensResults);
  const poolTokenAddresses = poolTokens.map((finalTokens) => finalTokens?.[0]);

  const zipped = zip(allPools, poolTokenAddresses);
  const poolForTokenZippedItem = zipped.find(([pool, finalTokens]) =>
    findTokenAddress(finalTokens, tokenContract)
  );
  // First element is the pool
  return poolForTokenZippedItem?.[0];
}

function findTokenAddress(
  finalTokens: string[] | undefined,
  tokenContract: ERC20 | undefined
): string | undefined {
  return finalTokens?.find(
    (tokenAddress) => tokenAddress === tokenContract?.address
  );
}
