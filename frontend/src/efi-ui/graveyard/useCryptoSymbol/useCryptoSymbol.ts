import { useQuery } from "react-query";

import {
  CoinGeckoCryptoId,
  CoinGeckoCryptoIdsOld,
  fetchCryptoSymbolOld,
} from "efi/graveyard/coingecko";
import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

export function useCryptoSymbol(cryptoSymbol: CryptoSymbolOld) {
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
  cryptoSymbol: CryptoSymbolOld;
}

export function makeCryptoSymbolQueryKey(
  cryptoSymbol: CryptoSymbolOld
): [string, CryptoSymbolVariables] {
  return ["crypto-symbol", { cryptoSymbol }];
}
