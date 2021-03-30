import { Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";

// TODO: grab these from a InterestTokenCreated event when we have it
export function useInterestTokens(
  tranches: Tranche[],
  signerOrProvider?: Signer | Provider
): InterestToken[] {
  const results = useSmartContractReadCalls(tranches, "interestToken");
  const addresses = results
    .map(({ data }) => data)
    .filter((address): address is string => !!address);

  const contracts = addresses.map((address) =>
    InterestToken__factory.connect(address, signerOrProvider || jsonRpcProvider)
  );

  return contracts;
}
