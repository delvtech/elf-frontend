import { Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";

import { useTrancheContract } from "efi-ui/tranche/useTrancheContract";
import ContractAddresses from "efi/contracts/contractsJson";

// TODO: convert this to filtering the TrancheFactory for tranches deployed by elementAddress
export function useTrancheContracts(
  signerOrProvider?: Signer | Provider
): Tranche[] {
  const { wethTrancheAddress } = ContractAddresses;

  const wethTrancheContract = useTrancheContract(
    wethTrancheAddress,
    signerOrProvider
  );

  // TODO: Uncomment this when the usdc contract is deployed to the testnet
  // const usdcTrancheContract = useTrancheContract(
  //   trancheUsdcAddress,
  //   signerOrProvider
  // );

  const trancheContracts = [
    wethTrancheContract,
    // TODO: Uncomment this when the usdc contract is deployed to the testnet
    //  usdcTrancheContract
  ].filter((tranche): tranche is Tranche => !!tranche);

  return trancheContracts;
}
