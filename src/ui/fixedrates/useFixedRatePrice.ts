import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
} from "@elementfi/tokenlist";
import { getZapPurchaseTokenGraph } from "elf/zaps/zapPurchase/zapPurchase";
import { useMarketPrice } from "ui/ccpools/useMarketPrice";
import { useCurveLpTokenPrice } from "ui/curve/prices";
import { useZapPurchaseTokenGraph } from "ui/zaps/useZapPurchaseTokenGraph";

export function useFixedRatePrice(
  principalTokenInfo: PrincipalTokenInfo,
  inputToken: TokenInfo
): string {
  const principalPrice = useMarketPrice(principalTokenInfo);
  const graph = getZapPurchaseTokenGraph(principalTokenInfo, inputToken);
  console.log(graph);

  const { data: price } = useCurveLpTokenPrice(
    graph?.metaToken as CurveLpTokenInfo,
    graph?.token as TokenInfo
  );

  console.log(graph?.baseToken.name, price);
  if (!price) return principalPrice;

  return principalPrice;
}
