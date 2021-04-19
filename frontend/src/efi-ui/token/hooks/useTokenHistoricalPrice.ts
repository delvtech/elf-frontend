import { ERC20 } from "elf-contracts/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useCoinGeckoHistoricalPrice } from "efi-ui/coingecko/useCoinGeckoHistoricalPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

export function useTokenHistoricalPrice<TContract extends ERC20>(
  contract: TContract | undefined,
  currency: Currency,
  daysAgo: number
): ComputedQueryResult<Money> {
  const tokenSymbolResult = useTokenSymbol(contract);
  const priceResult = useCoinGeckoHistoricalPrice(
    getCoinGeckoId(tokenSymbolResult.data),
    currency,
    daysAgo
  );

  return [priceResult.data, [tokenSymbolResult, priceResult]];
}
