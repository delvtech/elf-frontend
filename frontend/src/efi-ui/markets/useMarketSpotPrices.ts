import { QueryObserverResult } from "react-query";

import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useMarketPairedTokens } from "efi-ui/markets/useMarketPairedTokens";

export function useMarketSpotPrices(
  markets: (BPool | undefined)[],
  priceOfTheseTokens: (ERC20 | undefined)[]
): QueryObserverResult<BigNumber>[] {
  const inTheseTokens = useMarketPairedTokens(markets, priceOfTheseTokens);

  const spotPriceOptions = zip(priceOfTheseTokens, inTheseTokens).map(
    ([priceOfThisToken, inThisToken]) => ({
      enabled: !!priceOfThisToken && !!inThisToken,
      callArgs: [inThisToken?.address, priceOfThisToken?.address] as [
        string,
        string
      ],
    })
  );

  const spotPriceResults = useSmartContractReadCalls(
    markets,
    "getSpotPrice",
    spotPriceOptions
  );

  return spotPriceResults;
}
