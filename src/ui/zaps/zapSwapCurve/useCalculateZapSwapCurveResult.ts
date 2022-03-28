import { ZapSwapCurveContract } from "elf/zaps/zapSwapCurve/contracts";
import { ZapSwapCurveBuyInputs } from "elf/zaps/zapSwapCurve/createZapSwapCurveInputs";
import { ethers } from "ethers";
import { useSmartContractReadCall } from "ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useCalculateZapSwapCurveResult({
  info,
  baseZap,
  metaZap,
}: ZapSwapCurveBuyInputs): { amountOut: string; error: boolean } {
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
