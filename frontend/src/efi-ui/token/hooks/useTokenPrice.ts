import { ERC20 } from "elf-contracts/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract,
  currency: Currency
): ComputedQueryResult<Money> {
  const [tokenSymbol, tokenSymbolLoadingStates] = useTokenSymbol(contract);

  const priceResult = useCoinGeckoPrice(getCoinGeckoId(tokenSymbol), currency);

  return [priceResult.data, [...tokenSymbolLoadingStates, priceResult]];
}
