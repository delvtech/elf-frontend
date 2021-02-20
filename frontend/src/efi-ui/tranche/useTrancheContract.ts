import { Provider } from "@ethersproject/providers";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Signer } from "ethers";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { Tranche } from "elf-contracts/types/Tranche";

export function useTrancheContract(
  address: string | undefined,
  signerOrProvider?: Signer | Provider
): Tranche | undefined {
  return useSmartContractFromFactory(
    address,
    Tranche__factory.connect,
    signerOrProvider
  );
}
