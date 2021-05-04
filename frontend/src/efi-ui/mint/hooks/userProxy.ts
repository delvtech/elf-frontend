import { useWeb3React } from "@web3-react/core";
import { UserProxy__factory } from "elf-contracts/types/factories/UserProxy__factory";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { Signer } from "ethers";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import ContractAddresses from "efi/addresses";

export function useUserProxy(): UserProxy | undefined {
  const { library, account } = useWeb3React();
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const userProxy = getSmartContractFromRegistry(
    ContractAddresses.userProxyContractAddress,
    UserProxy__factory.connect,
    signer
  );
  return userProxy;
}
