import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import {
  getZapPurchaseTokenGraph,
  ZapPurchaseTokenGraph,
} from "elf/zaps/zapPurchase/zapPurchase";
import { useMemo } from "react";

export function useZapPurchaseTokenGraph(
  principalToken: PrincipalTokenInfo,
  token: TokenInfo
): ZapPurchaseTokenGraph | undefined {
  return useMemo(
    () => getZapPurchaseTokenGraph(principalToken, token),
    [principalToken, token]
  );
}
