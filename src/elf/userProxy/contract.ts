import { AddressesJson } from "elf/addresses";
import { defaultProvider } from "elf/providers/providers";
import { UserProxy__factory } from "elf-contracts-typechain/dist/types/factories/UserProxy__factory";

export const userProxyContract = UserProxy__factory.connect(
  AddressesJson.addresses.userProxyContractAddress,
  defaultProvider
);
