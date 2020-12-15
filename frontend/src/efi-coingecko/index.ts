import coinsJSON from "efi-coingecko/coins.json";

/**
 * Lookup object for getting the CoinGecko coin id from the coin or token's
 * symbol.
 *
 *  Eg:
 *  CoinGeckoIds.eth === 'ethereum' // true
 *
 * This can then be used to make calls to CoinGecko apis about ethereum, ie: price apis.
 *
 * TODO: This can be auto-generated instead of created at runtime.
 */
export const CoinGeckoIds: {
  [symbol: string]: string;
} = coinsJSON.reduce(
  (memo, value) => ({ ...memo, [value.symbol]: value.symbol }),
  {}
);

export function getCoinGeckoId(symbol: string | undefined) {
  if (!symbol) {
    return;
  }

  return CoinGeckoIds[symbol.toLowerCase()];
}
export async function fetchCoinGeckoPrice(
  coinGeckoId: string,
  currencyDenomination = "usd"
): Promise<number> {
  const result = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=${currencyDenomination}`
  );

  // Result looks like:
  // { dai: { usd: 1.01 } }
  const resultJSON = (await result.json()) as Record<
    string,
    Record<string, number>
  >;

  const price = resultJSON[coinGeckoId][currencyDenomination];

  return price;
}
