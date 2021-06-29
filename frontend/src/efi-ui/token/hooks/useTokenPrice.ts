import { ERC20 } from "elf-contracts/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { getTokenInfo } from "efi/tokenlists";
import { QueryObserverResult } from "react-query";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract | undefined,
  currency: Currency
): QueryObserverResult<Money> {
  const tokenSymbolResult = contract
    ? getTokenInfo(contract.address).symbol
    : undefined;
  const priceResult = useCoinGeckoPrice(
    getCoinGeckoId(tokenSymbolResult),
    currency
  );

  return priceResult;
}
