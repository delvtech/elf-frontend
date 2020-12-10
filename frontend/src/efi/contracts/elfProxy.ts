import elfProxyAbi from "elf-contracts/contracts/ElfProxy.json";
import { Contract } from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { ElfProxy } from "elf-contracts/types/ElfProxy";

export const elfProxyContract = new Contract(
  ContractAddresses.ELF_PROXY,
  elfProxyAbi,
  jsonRpcProvider
) as ElfProxy;
