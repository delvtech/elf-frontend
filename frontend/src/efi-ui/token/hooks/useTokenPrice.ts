import { ERC20 } from "elf-contracts/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { getTokenInfo } from "efi/tokenlists";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract | undefined,
  currency: Currency
): ComputedQueryResult<Money> {
  const tokenSymbolResult = contract
    ? getTokenInfo(contract.address).symbol
    : undefined;
  const priceResult = useCoinGeckoPrice(
    getCoinGeckoId(tokenSymbolResult),
    currency
  );

  return [priceResult.data, [priceResult]];
}
