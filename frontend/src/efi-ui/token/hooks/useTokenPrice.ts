import { ERC20 } from "elf-contracts/types/ERC20";

import { getCoinGeckoId } from "efi-coingecko";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

export function useTokenPrice<TContract extends ERC20>(
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
