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

  // TODO: Use this factory based approach once the YVaultAssetProxyFactory exists
  // 'args' are the args passed to the 'NewBPool' event.  The second one is the address of the new
  // pool.
  // const bPoolAddresses = data.map<string>((result) => result.args?.[1]);
  // const signer = signerOrProvider ?? jsonRpcProvider;
  // const bPoolContracts = bPoolAddresses.map((address) =>
  //   BPool__factory.connect(address, signer)
  // );
  return [fyWethPool];
}

// TODO: Use this factory based approach once the YVaultAssetProxyFactory exists
// function fetchMarketContractAddresses(signerOrProvider?: Signer | Provider) {
//   const signer = signerOrProvider ?? jsonRpcProvider;
//   const { elementAddress, bFactoryAddress } = ContractAddresses;
//   const bFactoryContract = BFactory__factory.connect(bFactoryAddress, signer);
//   const filter = bFactoryContract.filters.LOG_NEW_POOL(elementAddress, null);
//   return bFactoryContract.queryFilter(filter);
// }
