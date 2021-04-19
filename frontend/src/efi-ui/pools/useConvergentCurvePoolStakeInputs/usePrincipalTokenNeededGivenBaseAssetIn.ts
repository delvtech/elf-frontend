import { useMemo } from "react";

import { BigNumber } from "ethers";

import { LPOutGivenTokenIn } from "efi/pools/calculateLPOutGivenIn";

import { calculatePrincipalTokenNeededForBaseAssetIn } from "./calculatePrincipalTokenNeededForBaseAssetIn";

export function usePrincipalTokenNeededGivenBaseAssetIn(
  baseAssetTokenInAmount: number | undefined,
  decimalsBaseAsset: number | undefined,
  baseAssetReserves: BigNumber | undefined,
  principalTokenReserves: BigNumber | undefined,
  decimalsPrincipalToken: number | undefined,
  totalSupply: BigNumber | undefined
): LPOutGivenTokenIn | undefined {
  return useMemo(() => {
    if (
      baseAssetTokenInAmount === undefined ||
      !decimalsPrincipalToken ||
      !principalTokenReserves ||
      !baseAssetReserves ||
      !decimalsBaseAsset ||
      !totalSupply
    ) {
      return;
    }
    return calculatePrincipalTokenNeededForBaseAssetIn(
      baseAssetTokenInAmount,
      principalTokenReserves,
      baseAssetReserves,
      totalSupply,
      decimalsPrincipalToken,
      decimalsBaseAsset
    );
  }, [
    decimalsPrincipalToken,
    baseAssetTokenInAmount,
    principalTokenReserves,
    decimalsBaseAsset,
    baseAssetReserves,
    totalSupply,
  ]);
}
