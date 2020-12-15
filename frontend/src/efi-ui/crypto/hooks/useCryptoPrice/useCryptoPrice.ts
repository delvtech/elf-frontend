import { useQuery } from "react-query";

import {
  CoinGeckoCryptoId,
  CoinGeckoCryptoIdsOld,
  fetchCryptoPriceOld,
} from "efi/crypto/coingecko";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export function useCryptoPriceOld(
  cryptoSymbol: CryptoSymbol,
  denomination = "usd"
) {
  const enabled = !!CoinGeckoCryptoIdsOld[cryptoSymbol];

  return useQuery(
    makeCryptoPriceQueryKeyOld(cryptoSymbol),
    async (key: string, variables: CryptoPriceVariablesOld) => {
      const price = await fetchCryptoPriceOld(
        // safe to cast because this query is only enabled when it exists
        CoinGeckoCryptoIdsOld[variables.cryptoSymbol] as CoinGeckoCryptoId,
        denomination.toLowerCase()
      );
      return price;
    },
    { enabled }
  );
}

interface CryptoPriceVariablesOld {
  cryptoSymbol: CryptoSymbol;
}

function makeCryptoPriceQueryKeyOld(
  cryptoSymbol: CryptoSymbol
): [string, CryptoPriceVariablesOld] {
  return ["crypto-price", { cryptoSymbol }];
}
