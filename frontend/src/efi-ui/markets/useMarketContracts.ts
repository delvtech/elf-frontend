import { useQuery } from "react-query";

import { BPool } from "elf-contracts/types/BPool";
import { BFactory__factory } from "elf-contracts/types/factories/BFactory__factory";
import { BPool__factory } from "elf-contracts/types/factories/BPool__factory";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

export function useMarketContracts(
  signerOrProvider?: Signer | Provider
): BPool[] {
  const queryKey = "market-contracts";
  const queryFn = () => fetchMarketContractAddresses(signerOrProvider);

  const { data } = useQuery({ queryKey, queryFn });

  if (!data) {
    return [];
  }

  // 'args' are the args passed to the 'NewBPool' event.  The second one is the address of the new
  // pool.
  const bPoolAddresses = data.map<string>((result) => result.args?.[1]);
  const signer = signerOrProvider ?? jsonRpcProvider;
  const bPoolContracts = bPoolAddresses.map((address) =>
    BPool__factory.connect(address, signer)
  );
  return bPoolContracts;
}

const FAKE_BFACTORY_ADDRES_FOR_IMMEDIATE_REFACTOR = "xxx";
function fetchMarketContractAddresses(signerOrProvider?: Signer | Provider) {
  const signer = signerOrProvider ?? jsonRpcProvider;
  const { elementAddress } = ContractAddresses;

  const bFactoryContract = BFactory__factory.connect(
    FAKE_BFACTORY_ADDRES_FOR_IMMEDIATE_REFACTOR,
    signer
  );
  const filter = bFactoryContract.filters.LOG_NEW_POOL(elementAddress, null);
  return bFactoryContract.queryFilter(filter);
}
