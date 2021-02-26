import { Provider } from "@ethersproject/providers";
import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useMarketContracts } from "efi-ui/markets/useMarketContracts";

export function useMarketsForTokens(
  tokenContracts: (ERC20 | undefined)[],
  signerOrProvider?: Signer | Provider
): (BPool | undefined)[] {
  const allMarkets = useMarketContracts(signerOrProvider);
  const finalTokensResults = useSmartContractReadCalls(
    allMarkets,
    "getFinalTokens"
  );
  const finalTokens = getQueriesData(finalTokensResults);

  const zippedItems = zip(
    allMarkets,
    finalTokens
  ).filter((zippedItem): zippedItem is [BPool, string[]] =>
    zippedItem.every((item) => !!item)
  );

  const markets = tokenContracts.map((tokenContract) => {
    const [market] =
      zippedItems.find(([market, finalTokens]) =>
        findTokenAddress(finalTokens, tokenContract)
      ) || [];

    return market;
  });

  return markets;
}

function findTokenAddress(
  finalTokens: string[],
  tokenContract: ERC20 | undefined
): string | undefined {
  return finalTokens.find(
    (tokenAddress) => tokenAddress === tokenContract?.address
  );
}
