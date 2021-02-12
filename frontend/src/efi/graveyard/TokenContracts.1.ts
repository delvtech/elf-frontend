import { ERC20 } from "elf-contracts/types/ERC20";

import { usdcContract, wethContract } from "../crypto/TokenContracts";
import { TokenContractSymbols } from "../crypto/TokenContractSymbols";

/**
 * Lookup table for ERC20 tokens
 */

export const TokenContracts: Record<TokenContractSymbols, ERC20> = {
  WETH: wethContract,
  USDC: usdcContract,
};
