import erc20abi from "elf-contracts/contracts/ERC20.json";
import { Erc20 } from "elf-contracts/types/Erc20";
import { Contract } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import {
  USDC_CONTRACT_ADDRESS_MAINNET,
  wethAddress,
} from "./TokenContractAddresses";
import { TokenContractSymbols } from "./TokenContractSymbols";

export const wethContract = new Contract(
  wethAddress,
  erc20abi,
  jsonRpcProvider
) as Erc20;

export const usdcContract = new Contract(
  USDC_CONTRACT_ADDRESS_MAINNET,
  erc20abi,
  jsonRpcProvider
) as Erc20;

/**
 * Lookup table for ERC20 tokens
 */
export const TokenContracts: Record<TokenContractSymbols, Erc20> = {
  WETH: wethContract,
  USDC: usdcContract,
};
