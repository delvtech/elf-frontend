import { Tranche } from "elf-contracts-typechain/dist/types/Tranche";

import { useOpenPrincipalTokenInfos } from "elf-ui/tranche/useOpenPrincipalTokenInfos";
import { trancheContractsByAddress } from "elf/tranche/tranches";

export function useOpenTrancheContracts(): Tranche[] {
  const openPrincipalTokenInfos = useOpenPrincipalTokenInfos();
  const openTrancheContracts = openPrincipalTokenInfos.map(
    ({ address }) => trancheContractsByAddress[address]
  );
  return openTrancheContracts;
}
