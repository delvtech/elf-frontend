import { useMemo } from "react";
import { QueryResult } from "react-query";

import { BigNumber } from "ethers";
import { Money } from "ts-money";

import { useCryptoPrice } from "efi-ui/crypto/hooks/useCryptoPrice/useCryptoPrice";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { convertToFiatBalance } from "efi/money/convertToFiatBalance";

type CryptoPriceQueryResult = QueryResult<number>;

/**
 * Converts a cryptocurrency balance to the user's preferred fiat balance.
 *
 * @param {CryptoSymbol} cryptoSymbol
 * @param {BigNumber | undefined} cryptoFractionalValue
 * @param {number | undefined} cryptoDecimals
 * @returns {Money | undefined}
 */
export function useConvertToFiatBalance(
  cryptoSymbol: CryptoSymbol,
  cryptoFractionalValue: BigNumber | undefined,
  cryptoDecimals: number | undefined
): [Money | undefined, CryptoPriceQueryResult] {
  const { currency } = useCurrencyPref();
  const priceResult = useCryptoPrice(cryptoSymbol, currency.code);
  const { data: cryptoPrice } = priceResult;
  return useMemo(() => {
    if (
      cryptoPrice === undefined ||
      cryptoFractionalValue === undefined ||
      cryptoDecimals === undefined
    ) {
      return [undefined, priceResult];
    }
    const fiatBalance = convertToFiatBalance(
      cryptoPrice,
      currency.code,
      cryptoFractionalValue,
      cryptoDecimals
    );

    return [fiatBalance, priceResult];
  }, [
    cryptoDecimals,
    cryptoFractionalValue,
    cryptoPrice,
    currency.code,
    priceResult,
  ]);
}
