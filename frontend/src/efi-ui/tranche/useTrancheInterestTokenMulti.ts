import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import { QueryObserverResult } from "react-query";

export function useInterestTokenForTranche(
  tranche: Tranche | undefined
): InterestToken | undefined {
  const { data: interestTokenAddress } = useSmartContractReadCall(
    tranche,
    "interestToken",
    {
      staleTime: Infinity,
    }
  );

  return getSmartContractFromRegistry(
    interestTokenAddress,
    InterestToken__factory.connect
  );
}

export function useTrancheInterestTokenMulti(
  tranches: (Tranche | undefined)[]
): QueryObserverResult<string>[] {
  return useSmartContractReadCalls(tranches, "interestToken", {
    staleTime: Infinity,
  });
}
