import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "elf-coingecko";
import { useCoinGeckoHistoricalPrice } from "elf-ui/coingecko/useCoinGeckoHistoricalPrice";
import { getTokenInfo } from "elf/tokenlists";
import { QueryObserverResult } from "react-query";

export function useTokenHistoricalPrice<TContract extends ERC20>(
  contract: TContract | undefined,
  currency: Currency,
  daysAgo: number
): QueryObserverResult<Money> {
  const tokenSymbolResult = contract
    ? getTokenInfo(contract.address).symbol
    : undefined;
  const priceResult = useCoinGeckoHistoricalPrice(
    getCoinGeckoId(tokenSymbolResult),
    currency,
    daysAgo
  );

  return priceResult;
}
