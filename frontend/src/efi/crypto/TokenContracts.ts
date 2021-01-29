import { Erc20Factory } from "elf-contracts/types/Erc20Factory";
import { WethFactory } from "elf-contracts/types/WethFactory";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import {
  USDC_CONTRACT_ADDRESS_MAINNET,
  wethAddress,
} from "./TokenContractAddresses";
import { TokenContractSymbols } from "./TokenContractSymbols";
import { Contract } from "ethers";

export const wethContract = WethFactory.connect(wethAddress, jsonRpcProvider);

export const usdcContract = Erc20Factory.connect(
  USDC_CONTRACT_ADDRESS_MAINNET,
  jsonRpcProvider
);

/**
 * Lookup table for ERC20 tokens
 */
export const TokenContracts: Record<TokenContractSymbols, Contract> = {
  WETH: wethContract,
  USDC: usdcContract,
};
