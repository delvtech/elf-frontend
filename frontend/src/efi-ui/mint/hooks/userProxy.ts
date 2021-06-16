import { UserProxy__factory } from "elf-contracts/types/factories/UserProxy__factory";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { Signer } from "ethers";

import ContractAddresses from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

export function getUserProxy(signer?: Signer): UserProxy {
  const userProxy = getSmartContractFromRegistry(
    ContractAddresses.userProxyContractAddress,
    UserProxy__factory.connect,
    signer
  ) as UserProxy;

  return userProxy;
}
