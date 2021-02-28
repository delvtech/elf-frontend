import { QueryObserverResult } from "react-query";

import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useMarketPairedToken } from "efi-ui/markets/useMarketPairedToken";

export function useMarketSpotPrice(
  market: BPool | undefined,
  priceOfThisToken: ERC20 | undefined
): QueryObserverResult<BigNumber> {
  const inThisToken = useMarketPairedToken(market, priceOfThisToken);

  const spotPriceResult = useSmartContractReadCall(market, "getSpotPrice", {
    enabled: !!priceOfThisToken && !!inThisToken,
    // safe to cast since query is disabled until these exist
    callArgs: [inThisToken?.address, priceOfThisToken?.address] as [
      string,
      string
    ],
  });

  return spotPriceResult;
}
