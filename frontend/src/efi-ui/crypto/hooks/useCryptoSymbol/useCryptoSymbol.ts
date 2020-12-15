import { useQuery } from "react-query";

import {
  CoinGeckoCryptoId,
  CoinGeckoCryptoIdsOld,
  fetchCryptoSymbolOld,
} from "efi/crypto/coingecko";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export function useCryptoSymbol(cryptoSymbol: CryptoSymbol) {
  const enabled = !!CoinGeckoCryptoIdsOld[cryptoSymbol];

  return useQuery(
    makeCryptoSymbolQueryKey(cryptoSymbol),
    async (key: string, variables: CryptoSymbolVariables) => {
      const price = await fetchCryptoSymbolOld(
        // safe to cast because this query is only enabled when it exists
        CoinGeckoCryptoIdsOld[variables.cryptoSymbol] as CoinGeckoCryptoId
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
