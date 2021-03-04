import { Tranche, Tranche__factory, YC } from "elf-contracts/types";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTrancheForYieldCoupon(yieldCoupon: YC): Tranche | undefined {
  const { data: trancheAddress } = useSmartContractReadCall(
    yieldCoupon,
    "tranche"
  );
  const tranche = useSmartContractFromFactory(
    trancheAddress,
    Tranche__factory.connect
  );
  return tranche;
}
