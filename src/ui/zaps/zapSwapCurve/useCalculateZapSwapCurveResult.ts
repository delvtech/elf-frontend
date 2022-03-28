import { ZapSwapCurveBuyInputs } from "elf/zaps/zapSwapCurve/createZapSwapCurveInputs";
import { ethers } from "ethers";

export function useCalculateZapSwapCurveResult({
  info,
  baseZap,
  metaZap,
}: ZapSwapCurveBuyInputs): { amountOut: string; error: boolean } {
  const isEmptyCase = baseZap.curvePool === ethers.constants.AddressZero;

  // const x = useSmartContractReadCall(ZapSwapCurveContract, "zapIn", {
  //   callArgs: [
  //     info,
  //     baseZap,
  //     metaZap,
  //     [],
  //     { from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  //   ],
  //   enabled: !isEmptyCase,
  // });
  return { amountOut: "", error: false };
}
