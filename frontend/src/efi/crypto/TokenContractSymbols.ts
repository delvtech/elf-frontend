import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

/**
 * List of tokens we have contract interfaces for.
 */
export type TokenContractSymbols = Extract<CryptoSymbolOld, "WETH" | "USDC">;
