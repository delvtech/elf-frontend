import { useQuery } from "react-query";

import {
  CoinGeckoCryptoId,
  CoinGeckoCryptoIds,
  fetchCryptoSymbol,
} from "efi/crypto/coingecko";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export function useCryptoSymbol(cryptoSymbol: CryptoSymbol) {
  const enabled = !!CoinGeckoCryptoIds[cryptoSymbol];

  return useQuery(
    makeCryptoSymbolQueryKey(cryptoSymbol),
    async (key: string, variables: CryptoSymbolVariables) => {
      console.log("variables", variables);
      console.log("key", key);
      const price = await fetchCryptoSymbol(
        // safe to cast because this query is only enabled when it exists
        CoinGeckoCryptoIds[variables.cryptoSymbol] as CoinGeckoCryptoId
      );
      return price;
    },
    { enabled }
  );
}

interface CryptoSymbolVariables {
  cryptoSymbol: CryptoSymbol;
}

export function makeCryptoSymbolQueryKey(
  cryptoSymbol: CryptoSymbol
): [string, CryptoSymbolVariables] {
  return ["crypto-symbol", { cryptoSymbol }];
}
