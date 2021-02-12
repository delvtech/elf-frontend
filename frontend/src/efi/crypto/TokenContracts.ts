import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import {
  USDC_CONTRACT_ADDRESS_LOCAL,
  wethAddress,
} from "./TokenContractAddresses";

export const wethContract = ERC20__factory.connect(
  wethAddress,
  jsonRpcProvider
);

export const usdcContract = ERC20__factory.connect(
  USDC_CONTRACT_ADDRESS_LOCAL,
  jsonRpcProvider
);
