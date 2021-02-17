import { Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";

import { useTrancheContract } from "efi-ui/tranche/useTrancheContract";
import ContractAddresses from "efi/contracts/contractsJson";
import { useQueries } from "react-query";

export function useTrancheContracts(signerOrProvider?: Signer | Provider) {
  const { trancheUsdcAddress, trancheWethAddress } = ContractAddresses;

  const wethTrancheContract = useTrancheContract(
    trancheWethAddress,
    signerOrProvider
  );
  const usdcTrancheContract = useTrancheContract(
    trancheUsdcAddress,
    signerOrProvider
  );

  const trancheContracts = [wethTrancheContract, usdcTrancheContract].filter(
    (tranche): tranche is Tranche => !!tranche
  );

  return trancheContracts;
}
