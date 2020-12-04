import { Erc20 } from "elf-contracts/types/Erc20";
import { Contract } from "ethers";

import erc20abi from "efi/crypto/erc20abi.json";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import {
  USDC_CONTRACT_ADDRESS_MAINNET,
  wethAddress,
} from "./TokenContractAddresses";
import { TokenContractSymbols } from "./TokenContractSymbols";

const WethContract = new Contract(
  wethAddress,
  erc20abi,
  jsonRpcProvider
) as Erc20;

const UsdcContract = new Contract(
  USDC_CONTRACT_ADDRESS_MAINNET,
  erc20abi,
  jsonRpcProvider
) as Erc20;

/**
 * Lookup table for ERC20 tokens
 */
export const TokenContracts: Record<TokenContractSymbols, Erc20> = {
  WETH: WethContract,
  USDC: UsdcContract,
};
