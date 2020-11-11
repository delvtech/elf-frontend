import { useQuery } from "react-query";

import {
  CoinGeckoCryptoId,
  CoinGeckoCryptoIds,
  fetchCryptoPrice,
} from "efi/crypto/coingecko";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export function useCryptoPrice(
  cryptoSymbol: CryptoSymbol,
  denomination: string
) {
  const enabled = !!CoinGeckoCryptoIds[cryptoSymbol];

  return useQuery(
    makeCryptoPriceQueryKey(cryptoSymbol),
    async (key: string, variables: CryptoPriceVariables) => {
      const price = await fetchCryptoPrice(
        // safe to cast because this query is only enabled when it exists
        CoinGeckoCryptoIds[variables.cryptoSymbol] as CoinGeckoCryptoId,
        denomination.toLowerCase()
      );
      return price;
    },
    { enabled }
  );
}

interface CryptoPriceVariables {
  cryptoSymbol: CryptoSymbol;
}

export function makeCryptoPriceQueryKey(
  cryptoSymbol: CryptoSymbol
): [string, CryptoPriceVariables] {
  return ["crypto-price", { cryptoSymbol }];
}
