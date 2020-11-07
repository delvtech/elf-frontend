import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

/**
 * Supported crypto ids
 */
export type CoinGeckoCryptoId = "ethereum" | "dai" | "yearn-finance";

/**
 * Crosswalk for looking up CoinGecko ids given an efi CryptoSymbol value.
 */
export const CoinGeckoCryptoIds: Record<
  CryptoSymbol,
  CoinGeckoCryptoId | undefined
> = {
  ETH: "ethereum",
  DAI: "dai",
  YFI: "yearn-finance",
  "ELF-H": undefined,
  "ELF-L": undefined,
  "ELF-M": undefined,
  yDAI: undefined,
  yETH: undefined,
  yTUSD: undefined,
  yUSDC: undefined,
  yUSDT: undefined,
};

export async function fetchCryptoPrice(
  cryptoId: CoinGeckoCryptoId,
  currencyDenomination = "usd"
): Promise<number> {
  const result = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${currencyDenomination}`
  );

  // Result looks like:
  // { dai: { usd: 1.01 } }
  const resultJSON = (await result.json()) as Record<
    string,
    Record<string, number>
  >;

  const price = resultJSON[cryptoId][currencyDenomination];

  return price;
}
