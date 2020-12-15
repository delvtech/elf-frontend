import { Erc20 } from "elf-contracts/types/Erc20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";

export function useTokenPrice<TContract extends Erc20>(
  contract: TContract,
  currencyDenomination = "usd"
): ComputedQueryResult<number> {
  const [tokenSymbol, tokenSymbolLoadingStates] = useTokenSymbol(contract);

  const priceResult = useCoinGeckoPrice(
    getCoinGeckoId(tokenSymbol),
    currencyDenomination
  );

  return [priceResult.data, [...tokenSymbolLoadingStates, priceResult]];
}

export function useTokenDecimals<TContract extends Erc20>(contract: TContract) {
  return useSmartContractReadCall(contract, "decimals");
}
