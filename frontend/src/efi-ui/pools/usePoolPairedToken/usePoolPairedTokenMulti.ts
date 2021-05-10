import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactoryMulti } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
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
      const pairedTokenAddress = allTokens?.[0].find(
        (address) => address !== thisToken?.address
      );
      return pairedTokenAddress;
    }
  );

  const pairedTokens = useSmartContractFromFactoryMulti(
    pairedTokenAddresses,
    ERC20__factory.connect
  );

  return pairedTokens;
}
