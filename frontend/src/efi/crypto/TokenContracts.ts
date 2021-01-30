import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import {
  USDC_CONTRACT_ADDRESS_MAINNET,
  wethAddress,
} from "./TokenContractAddresses";
import { TokenContractSymbols } from "./TokenContractSymbols";

export const wethContract = ERC20__factory.connect(
  wethAddress,
  jsonRpcProvider
);

export const usdcContract = ERC20__factory.connect(
  USDC_CONTRACT_ADDRESS_MAINNET,
  jsonRpcProvider
);

/**
 * Lookup table for ERC20 tokens
 */
export const TokenContracts: Record<TokenContractSymbols, ERC20> = {
  WETH: wethContract,
  USDC: usdcContract,
};
