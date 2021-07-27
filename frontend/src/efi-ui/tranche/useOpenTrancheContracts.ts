import { Tranche } from "elf-contracts-typechain/dist/types/Tranche";

import { useOpenPrincipalTokenInfos } from "efi-ui/tranche/useOpenPrincipaltokenInfos";
import { trancheContractsByAddress } from "efi/tranche/tranches";

export function useOpenTrancheContracts(): Tranche[] {
  const openPrincipalTokenInfos = useOpenPrincipalTokenInfos();
  const openTrancheContracts = openPrincipalTokenInfos.map(
    ({ address }) => trancheContractsByAddress[address]
  );
  return openTrancheContracts;
}
