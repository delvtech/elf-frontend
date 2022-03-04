import { Tranche } from "@elementfi/core-typechain";
import { useOpenPrincipalTokenInfos } from "ui/tranche/useOpenPrincipalTokenInfos";
import { trancheContractsByAddress } from "efi/tranche/tranches";

export function useOpenTrancheContracts(): Tranche[] {
  const openPrincipalTokenInfos = useOpenPrincipalTokenInfos();
  const openTrancheContracts = openPrincipalTokenInfos.map(
    ({ address }) => trancheContractsByAddress[address]
  );
  return openTrancheContracts;
}
