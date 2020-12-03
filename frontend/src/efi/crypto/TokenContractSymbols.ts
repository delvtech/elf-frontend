import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

/**
 * List of tokens we have contract interfaces for.
 */
export type TokenContractSymbols = Extract<CryptoSymbol, "WETH" | "USDC">;
