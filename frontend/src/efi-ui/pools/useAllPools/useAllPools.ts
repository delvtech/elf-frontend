import { Provider } from "@ethersproject/providers";
import { YieldCurvePool__factory } from "elf-contracts/types/factories/YieldCurvePool__factory";
import { Signer } from "ethers";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";
import { PoolContract } from "efi/pools/PoolContract";

export function useAllPools(
  signerOrProvider?: Signer | Provider
): (PoolContract | undefined)[] {
  const fyWethPool = useSmartContractFromFactory(
    ContractAddresses.marketFyWethAddress,
    YieldCurvePool__factory.connect,
    signerOrProvider
  );

  return [fyWethPool];
}
