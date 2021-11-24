import { useCallback } from "react";
import { QueryObserverResult } from "react-query";

import { CRVLUSD } from "elf-contracts-typechain/dist/types/CRVLUSD";
import { BigNumber } from "ethers";
import { Currencies, Money } from "ts-money";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { AddressesJson } from "efi/addresses";
import { formatBalance } from "efi/base/formatBalance";
import { ONE_MINUTE_IN_MILLISECONDS } from "efi/base/time";
import { isGoerli } from "efi/ethereum";

// Goerli curve stable pools can be inferred to be $1
const GOERLI_STUB_VIRTUAL_PRICE = {
  data: Money.fromDecimal(100, Currencies.USD, Math.round),
} as QueryObserverResult<Money>;

/**
 * Curve stable pools have a `get_virtual_price` method, since they're all
 * pegged assets ie: crvLUSD and crvALUSD.
 */

export function useCurveStablecoinPoolVirtualPrice(
  stablePoolContract: CRVLUSD | undefined,
  decimals: number
): QueryObserverResult<Money> {
  const { currency } = useCurrencyPref();

  const virtualPriceResult = useSmartContractReadCall(
    stablePoolContract,
    "get_virtual_price",
    {
      callArgs: [],
      staleTime: ONE_MINUTE_IN_MILLISECONDS,
      enabled: !!stablePoolContract,
      select: useCallback(
        (virtualPriceBigNumber: BigNumber): Money => {
          const price = +formatBalance(virtualPriceBigNumber, decimals);
          return Money.fromDecimal(price, currency, Math.round);
        },
        [currency, decimals]
      ),
    }
  );

  if (isGoerli(AddressesJson.chainId)) {
    return GOERLI_STUB_VIRTUAL_PRICE;
  }

  return virtualPriceResult;
}
