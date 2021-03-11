import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { YC } from "elf-contracts/types/YC";

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
