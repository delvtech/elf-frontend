import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

/**
 * @deprecated use getTrancheForInterestToken instead
 */
export function useTrancheForInterestToken(
  interestToken: InterestToken | undefined
): Tranche | undefined {
  const { data: trancheAddress } = useSmartContractReadCall(
    interestToken,
    "tranche"
  );
  const tranche = useSmartContractFromFactory(
    trancheAddress,
    Tranche__factory.connect
  );
  return tranche;
}
