import { Contract } from "ethers";

import erc20abi from "efi/crypto/erc20abi.json";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import {
  TokenSymbol,
  USDC_CONTRACT_ADDRESS_MAINNET,
  wethAddress,
} from "./tokenAddresses";

export const TokenContractsByName: Record<TokenSymbol, Contract> = {
  WETH: new Contract(wethAddress, erc20abi, jsonRpcProvider),
  USDC: new Contract(USDC_CONTRACT_ADDRESS_MAINNET, erc20abi, jsonRpcProvider),
};
