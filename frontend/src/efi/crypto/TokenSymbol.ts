import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

/**
 * List of tokens we'eve created contract interfaces for.
 */
export type TokenSymbol = Extract<CryptoSymbol, "WETH" | "USDC">;
