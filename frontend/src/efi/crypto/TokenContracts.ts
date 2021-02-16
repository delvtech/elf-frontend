import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export const wethContract = ERC20__factory.connect(
  ContractAddresses.wethAddress,
  jsonRpcProvider
);

export const usdcContract = ERC20__factory.connect(
  ContractAddresses.usdcAddress,
  jsonRpcProvider
);
