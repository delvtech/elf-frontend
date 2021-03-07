import { ERC20__factory } from "elf-contracts/types";
import { ERC20 } from "elf-contracts/types/ERC20";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";
import { PoolContract } from "efi/pools/PoolContract";

export function usePoolPairedTokenMulti(
  pools: (PoolContract | undefined)[],
  poolTokens: (ERC20 | undefined)[]
): (ERC20 | undefined)[] {
  const poolTokensResults = usePoolTokensMulti(pools);

  const allPoolTokens = getQueriesData(poolTokensResults) || [];

  const pairedTokenAddresses = zip(poolTokens, allPoolTokens).map(
    ([thisToken, allTokens]) => {
      const pairedTokenAddress = allTokens?.tokens.find(
        (address) => address !== thisToken?.address
      );
      return pairedTokenAddress;
    }
  );

  const pairedTokens = useSmartContractsFromFactory(
    pairedTokenAddresses,
    ERC20__factory.connect
  );

  return pairedTokens;
}
