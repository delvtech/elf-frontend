import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useMarketSpotPrice(
  market: BPool | undefined,
  priceOfThisToken: ERC20 | undefined
) {
  const marketTokensResult = useSmartContractReadCall(market, "getFinalTokens");
  const marketTokenAddresses = getQueryData(marketTokensResult) || [];
  const InThisToken = marketTokenAddresses.find(
    (address) => address !== priceOfThisToken?.address
  );

  const spotPriceResult = useSmartContractReadCall(market, "getSpotPrice", {
    enabled: !!priceOfThisToken && !!InThisToken,
    // safe to cast since query is disabled until these exist
    callArgs: [priceOfThisToken?.address, InThisToken] as [string, string],
  });

  return spotPriceResult;
}
