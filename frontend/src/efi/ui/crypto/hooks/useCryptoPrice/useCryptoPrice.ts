import { useQuery } from "react-query";

import { CoinGeckoCryptoIds, fetchCryptoPrice } from "efi/crypto/coingecko";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export function useCryptoPrice(cryptoSymbol: CryptoSymbol) {
  return useQuery(
    makeCryptoPriceQueryKey(cryptoSymbol),
    async (key: string, cryptoSymbol: CryptoSymbol) => {
      const coinGeckoCryptoId = CoinGeckoCryptoIds[cryptoSymbol];
      const price = await fetchCryptoPrice(coinGeckoCryptoId);
      return price;
    }
  );
}

export function makeCryptoPriceQueryKey(cryptoSymbol: CryptoSymbol) {
  return ["crypto-price", cryptoSymbol];
}
