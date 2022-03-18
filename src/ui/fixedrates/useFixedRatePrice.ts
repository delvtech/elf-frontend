import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
} from "@elementfi/tokenlist";
import { getZapPurchaseTokenGraph } from "elf/zaps/zapPurchase/zapPurchase";
import { useMemo } from "react";
import { useMarketPrice } from "ui/ccpools/useMarketPrice";
import { useCurveLpTokenPrice } from "ui/curve/prices";

export function useFixedRatePrice(
  principalTokenInfo: PrincipalTokenInfo,
  inputToken: TokenInfo
): string {
  const basePricePerUnitPrincipal = useMarketPrice(principalTokenInfo);
  const graph = useMemo(
    () => getZapPurchaseTokenGraph(principalTokenInfo, inputToken),
    [principalTokenInfo, inputToken]
  );

  const isTwoHops = !!graph?.metaToken;
  const { data: firstStepPrice } = useCurveLpTokenPrice(
    (isTwoHops ? graph.metaToken : graph?.baseToken) as CurveLpTokenInfo,
    graph?.token as TokenInfo,
    "1"
  );

  const { data: secondStepPrice } = useCurveLpTokenPrice(
    graph?.baseToken as CurveLpTokenInfo,
    (isTwoHops ? graph.metaToken : graph?.token) as TokenInfo,
    isTwoHops ? firstStepPrice : "1"
  );

  const basePricePerUnitInput = isTwoHops ? secondStepPrice : firstStepPrice;

  if (basePricePerUnitInput === undefined) return "0";

  return (+basePricePerUnitInput * +basePricePerUnitPrincipal).toString();
}
