import { useQuery } from "react-query";

import {
  CoinGeckoCryptoId,
  CoinGeckoCryptoIdsOld,
  fetchCryptoSymbolOld,
} from "efi/graveyard/coingecko";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export function useCryptoSymbol(cryptoSymbol: CryptoSymbol) {
  const enabled = !!CoinGeckoCryptoIdsOld[cryptoSymbol];

  return useQuery(
    makeCryptoSymbolQueryKey(cryptoSymbol),
    async () => {
      const price = await fetchCryptoSymbolOld(
        // safe to cast because this query is only enabled when it exists
        CoinGeckoCryptoIdsOld[cryptoSymbol] as CoinGeckoCryptoId
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
