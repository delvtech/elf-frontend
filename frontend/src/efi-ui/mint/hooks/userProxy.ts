import { Provider } from "@ethersproject/providers";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { UserProxy__factory } from "elf-contracts/types/factories/UserProxy__factory";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { Signer } from "ethers";

export function useUserProxy(
  signerOrProvider?: Signer | Provider
): UserProxy | undefined {
  const userProxy = useSmartContractFromFactory(
    ContractAddresses.userProxyContractAddress,
    UserProxy__factory.connect,
    signerOrProvider ?? jsonRpcProvider
  );
  return userProxy;
}
