import { Provider } from "@ethersproject/providers";
import { Elf } from "elf-contracts/types/Elf";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";

import { useElfContracts } from "efi-ui/contracts/useElfContracts/useElfContracts";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useElfContractsFromTranches(
  trancheContracts: Tranche[],
  signerOrProvider?: Signer | Provider
): (Elf | undefined)[] {
  // The elf contract assigned to the tranche tells us the base asset
  const elfAddressesResult = useSmartContractReadCalls(trancheContracts, "elf");
  const elfAddresses = elfAddressesResult.map((result) => result.data);
  const elfContracts = useElfContracts(elfAddresses, signerOrProvider);
  return elfContracts;
}
