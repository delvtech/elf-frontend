import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import { ONE_MINUTE_IN_MILLISECONDS } from "base/time";
import { ZapSwapCurveAddress } from "elf/zaps/zapSwapCurve/addresses";
import { zapSwapCurveContract } from "elf/zaps/zapSwapCurve/contracts";
import { createZapSwapCurveBuyInputs } from "elf/zaps/zapSwapCurve/createZapSwapCurveInputs";
import { useMarketPrice } from "ui/ccpools/useMarketPrice";
import { useSmartContractReadCall } from "ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useBaseTokenZapPrice } from "./useBaseTokenZapPrice";

export function usePrincipalTokenZapPrice(
  principalTokenInfo: PrincipalTokenInfo,
  inputToken: TokenInfo
): string {
  const basePricePerUnitPrincipal = useMarketPrice(principalTokenInfo);
  const basePricePerUnitCurvePoolToken = useBaseTokenZapPrice(
    principalTokenInfo,
    inputToken
  );
  return (
    +basePricePerUnitCurvePoolToken * +basePricePerUnitPrincipal
  ).toString();
}

export function usePrincipalTokenZapPriceAlt(
  principalToken: PrincipalTokenInfo,
  inputToken: TokenInfo
): string {
  const { info, baseZap, metaZap } = createZapSwapCurveBuyInputs(
    principalToken,
    inputToken,
    "1000", // we should get a 1000 USD worth of tokens by coingecko if not a stable
    ZapSwapCurveAddress //
  );

  const x = useSmartContractReadCall(zapSwapCurveContract, "zapIn", {
    callArgs: [info, baseZap, metaZap, []],
    staleTime: ONE_MINUTE_IN_MILLISECONDS,
  });

  console.log(x);
  return "";
}
