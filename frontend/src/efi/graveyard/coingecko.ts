import { Currencies } from "ts-money";

import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

/**
 * Supported crypto ids
 */
export type CoinGeckoCryptoId = "ethereum" | "dai" | "yearn-finance" | "weth";

/**
 * Crosswalk for looking up CoinGecko ids given an efi CryptoSymbol value.
 */
export const CoinGeckoCryptoIdsOld: Record<
  CryptoSymbolOld,
  CoinGeckoCryptoId | undefined
> = {
  USDC: undefined,
  ETH: "ethereum",
  WETH: "weth",
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

export async function fetchCryptoPriceOld(
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

/**
 * A temporary interface until we get full, codegened ones from coingecko's
 * swagger.json. This is not exhaustive, but just a whitelist of properties we
 * use.
 */
interface FetchCryptoSymbolResult {
  market_data: {
    current_price: Record<keyof typeof Currencies, number>;
  };
}

export async function fetchCryptoSymbolOld(
  cryptoId: CoinGeckoCryptoId
): Promise<FetchCryptoSymbolResult> {
  const result = await fetch(
    `https://api.coingecko.com/api/v3/coins/${cryptoId}?tickers=true&market_data=true`
  );

  const resultJSON = (await result.json()) as FetchCryptoSymbolResult;

  return resultJSON;
}
