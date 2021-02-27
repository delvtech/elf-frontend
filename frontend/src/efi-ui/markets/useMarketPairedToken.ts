import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { ERC20__factory } from "elf-contracts/types";

export function useMarketPairedToken(
  market: BPool | undefined,
  marketToken: ERC20 | undefined
): ERC20 | undefined {
  const marketTokensResult = useSmartContractReadCall(market, "getFinalTokens");
  const marketTokenAddresses = getQueryData(marketTokensResult) || [];
  const inThisToken = marketTokenAddresses.find(
    (address) => address !== marketToken?.address
  );

  const pairedToken = useSmartContractFromFactory(
    inThisToken,
    ERC20__factory.connect
  );

  return pairedToken;
}
