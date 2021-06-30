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
import { CRVLUSD__factory } from "elf-contracts/types/factories/CRVLUSD__factory";
import { defaultProvider } from "efi/providers/providers";
import { ChainId, isMainnet } from "efi/ethereum";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract,
  currency: Currency
): QueryObserverResult<Money> {
  const { symbol: tokenSymbol, decimals } = getTokenInfo(contract.address);

  // try and get the price from coingecko
  const priceResult = useCoinGeckoPrice(getCoinGeckoId(tokenSymbol), currency);

  // otherwise see if it's the mainnet crvlusd or crvALUSD pool
  const isCrvlusd = contract.address === AddressesJson.addresses.crvlusdAddress;
  const isCrvalusd =
    contract.address === AddressesJson.addresses.crvalusdAddress;
  const virtualPriceResult = useSmartContractReadCall(
    isMainnet(AddressesJson.chainId) && (isCrvlusd || isCrvalusd)
      ? CRVLUSD__factory.connect(contract.address, defaultProvider)
      : (contract as unknown as CRVLUSD),
    "get_virtual_price",
    // this is a hack so we disable this if the contract isn't specifically crvlusd
    {
      callArgs: [],
      enabled: isCrvlusd,
    }
  );

  // on goerli, we'll just hard-code crvlusd and crvalusd to 1, since there is
  // no goerli curve pools available
  if ((isCrvalusd || isCrvlusd) && AddressesJson.chainId === ChainId.GOERLI) {
    // return a fake query observer result, which sucks but yoloswag5000 for goerli testnet
    return {
      data: Money.fromDecimal(1, currency),
    } as QueryObserverResult<Money>;
  }

  // otherwise if we're on mainnet and it's a crv token, return it's virtual price
  if (isCrvlusd || isCrvalusd) {
    const priceString = formatBalance(virtualPriceResult.data, decimals);
    const price = Money.fromDecimal(
      +priceString,
      currency,
      // Money.fromDecimal will throw if price has more decimals than the currency
      // allows unless you pass a rounding function
      Math.round
    );

    return {
      ...virtualPriceResult,
      data: price,
    } as QueryObserverResult<Money>;
  }

  // if it's not a crv token, return the coingecko price
  return priceResult;
}
