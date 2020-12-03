import { Contract } from "ethers";

import erc20abi from "efi/crypto/erc20abi.json";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { USDC_CONTRACT_ADDRESS_MAINNET, wethAddress } from "./TokenAddresses1";
import { TokenContractSymbols } from "./TokenContractSymbols";

/**
 * lookup table for ERC20 tokens
 */
export const TokenContracts: Record<TokenContractSymbols, Contract> = {
  WETH: new Contract(wethAddress, erc20abi, jsonRpcProvider),
  USDC: new Contract(USDC_CONTRACT_ADDRESS_MAINNET, erc20abi, jsonRpcProvider),
};
