import { Provider } from "@ethersproject/providers";
import { BPool } from "elf-contracts/types/BPool";
import { Signer } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useMarketContracts } from "efi-ui/markets/useMarketContracts";
import { ERC20 } from "elf-contracts/types/ERC20";

export function useMarketForToken(
  tokenContract: ERC20 | undefined,
  signerOrProvider?: Signer | Provider
): BPool | undefined {
  const allMarkets = useMarketContracts(signerOrProvider);
  const finalTokensResults = useSmartContractReadCalls(
    allMarkets,
    "getFinalTokens"
  );
  const finalTokens = getQueriesData(finalTokensResults);

  const result = zip(allMarkets, finalTokens)
    .filter((v): v is [BPool, string[]] => v.every((v) => !!v))
    .find(([market, finalTokens]) =>
      findTokenAddress(finalTokens, tokenContract)
    );

  return result?.[0];
}

function findTokenAddress(
  finalTokens: string[],
  tokenContract: ERC20 | undefined
): string | undefined {
  return finalTokens.find(
    (tokenAddress) => tokenAddress === tokenContract?.address
  );
}
