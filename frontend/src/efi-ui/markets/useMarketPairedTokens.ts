import { BPool, ERC20, ERC20__factory } from "elf-contracts/types";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";

export function useMarketPairedTokens(
  markets: (BPool | undefined)[],
  marketTokens: (ERC20 | undefined)[]
): (ERC20 | undefined)[] {
  const finalTokensResults = useSmartContractReadCalls(
    markets,
    "getFinalTokens"
  );
  // the tokens in each market: [ ['0xA', "0xB"], ... ]
  const finalTokensAddresses = getQueriesData(finalTokensResults) || [];

  // the other token in each market: ['0xAp', '0xBp']
  const pairedTokenAddresses = zip(
    marketTokens,
    finalTokensAddresses
  ).map(([priceOfThisToken, finalTokenAddresses]) =>
    finalTokenAddresses?.find(
      (address) => address !== priceOfThisToken?.address
    )
  );

  const pairedTokens = useSmartContractsFromFactory(
    pairedTokenAddresses,
    ERC20__factory.connect
  );
  return pairedTokens;
}
