import { ZapSwapCurveContract } from "elf/zaps/zapPurchase/contracts";
import { ZapPurchaseInputs } from "elf/zaps/zapPurchase/createZapPurchaseInputs";
import { ethers } from "ethers";
import { useSmartContractReadCall } from "ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useCalculatePrincipalTokensAmountOutByZap({
  info,
  baseZap,
  metaZap,
}: ZapPurchaseInputs): { amountOut: string; error: boolean } {
  const isEmptyCase = baseZap.curvePool === ethers.constants.AddressZero;

  const x = useSmartContractReadCall(ZapSwapCurveContract, "zapIn", {
    callArgs: [
      info,
      baseZap,
      metaZap,
      [],
      { from: ZapSwapCurveContract.address },
    ],
    enabled: !isEmptyCase,
  });
  return { amountOut: "", error: false };
}
