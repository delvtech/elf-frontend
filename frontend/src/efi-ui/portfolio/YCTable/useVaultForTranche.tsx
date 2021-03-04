import {
  Elf__factory,
  ERC20,
  ERC20__factory,
  Tranche,
} from "elf-contracts/types";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useVaultForTranche(
  tranche: Tranche | undefined
): ERC20 | undefined {
  const elfAddressResult = useSmartContractReadCall(tranche, "elf");
  const elfContract = useSmartContractFromFactory(
    getQueryData(elfAddressResult),
    Elf__factory.connect
  );
  const vaultAddressResult = useSmartContractReadCall(elfContract, "vault");
  const vaultContract = useSmartContractFromFactory(
    getQueryData(vaultAddressResult),
    ERC20__factory.connect
  );
  return vaultContract;
}
