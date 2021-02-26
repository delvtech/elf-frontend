import { QueryObserverResult } from "react-query";

import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useMarketSpotPrices(
  markets: (BPool | undefined)[],
  priceOfTheseTokens: (ERC20 | undefined)[]
): (QueryObserverResult<BigNumber> | undefined)[] {
  const finalTokensResults = useSmartContractReadCalls(
    markets,
    "getFinalTokens"
  );
  // the tokens in each market: [ ['0xA', "0xB"], ... ]
  const finalTokensAddresses = getQueriesData(finalTokensResults) || [];

  // the other token in each market: ['0xAp', '0xBp']
  const inTheseTokens = zip(
    priceOfTheseTokens,
    finalTokensAddresses
  ).map(([priceOfThisToken, finalTokenAddresses]) =>
    finalTokenAddresses?.find(
      (address) => address !== priceOfThisToken?.address
    )
  );

  const spotPriceOptions = zip(priceOfTheseTokens, inTheseTokens).map(
    ([priceOfThisToken, inThisToken]) => ({
      enabled: !!priceOfThisToken && !!inThisToken,
      callArgs: [inThisToken, priceOfThisToken?.address] as [string, string],
    })
  );

  const spotPriceResults = useSmartContractReadCalls(
    markets,
    "getSpotPrice",
    spotPriceOptions
  );

  return spotPriceResults;
}
