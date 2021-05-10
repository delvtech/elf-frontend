import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import ContractAddresses from "efi/addresses";
import { defaultProvider } from "efi/providers/providers";

export const wethContract = ERC20__factory.connect(
  ContractAddresses.wethAddress,
  defaultProvider
);

export const usdcContract = ERC20__factory.connect(
  ContractAddresses.usdcAddress,
  defaultProvider
);
