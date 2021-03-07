import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { PoolContract } from "efi/pools/PoolContract";
import { useAllPools } from "efi-ui/pools/useAllPools/useAllPools";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";

export function usePoolForTokenMulti(
  tokenContracts: (ERC20 | undefined)[],
  signerOrProvider?: Signer | Provider
): (PoolContract | undefined)[] {
  const allPools = useAllPools(signerOrProvider);
  const poolTokensResults = usePoolTokensMulti(allPools);

  const zippedItems = zip(allPools, getQueriesData(poolTokensResults));

  const markets = tokenContracts.map((tokenContract) => {
    const [market] =
      zippedItems.find(([market, finalTokens]) =>
        findTokenAddress(finalTokens?.tokens, tokenContract)
      ) || [];

    return market;
  });

  return markets;
}

function findTokenAddress(
  finalTokens: string[] | undefined,
  tokenContract: ERC20 | undefined
): string | undefined {
  return finalTokens?.find(
    (tokenAddress) => tokenAddress === tokenContract?.address
  );
}
