import { QueryObserverResult } from "react-query";

import { CRVLUSD } from "elf-contracts/types/CRVLUSD";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { AddressesJson } from "efi/addresses";
import { formatBalance } from "efi/base/formatBalance";
import { getTokenInfo } from "efi/tokenlists";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract,
  currency: Currency
): QueryObserverResult<Money> {
  const { symbol: tokenSymbol, decimals } = getTokenInfo(contract.address);

  // try and get the price from coingecko
  const priceResult = useCoinGeckoPrice(getCoinGeckoId(tokenSymbol), currency);

  // otherwise see if it's the crvlusd pool
  const crvLusdVirtualPriceResult = useSmartContractReadCall(
    contract as unknown as CRVLUSD,
    "get_virtual_price",
    // this is a hack so we disable this if the contract isn't specifically crvlus
    {
      callArgs: [{}],
      enabled: contract.address === AddressesJson.addresses.crvlusdAddress,
    }
  );

  if (contract.address === AddressesJson.addresses.crvlusdAddress) {
    const priceString = formatBalance(crvLusdVirtualPriceResult.data, decimals);
    const price = Money.fromDecimal(
      +priceString,
      currency,
      // Money.fromDecimal will throw if price has more decimals than the currency
      // allows unless you pass a rounding function
      Math.round
    );

    return {
      ...crvLusdVirtualPriceResult,
      data: price,
    } as QueryObserverResult<Money>;
  }

  return priceResult;
}
