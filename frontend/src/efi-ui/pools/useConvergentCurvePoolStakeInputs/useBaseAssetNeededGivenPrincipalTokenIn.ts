import { useMemo } from "react";

import { BigNumber } from "ethers";

import { LPOutGivenTokenIn } from "efi/pools/calculateLPOutGivenIn";

import { calculateBaseAssetNeededForPrincipalTokenIn } from "./calculateBaseAssetNeededForPrincipalTokenIn";

export function useBaseAssetNeededGivenPrincipalTokenIn(
  principalTokenInAmount: number | undefined,
  decimalsPrincipalToken: number | undefined,
  principalTokenReserves: BigNumber | undefined,
  baseAssetReserves: BigNumber | undefined,
  decimalsBaseAsset: number | undefined,
  totalSupply: BigNumber | undefined
): LPOutGivenTokenIn | undefined {
  return useMemo(() => {
    if (
      principalTokenInAmount === undefined ||
      !decimalsPrincipalToken ||
      !principalTokenReserves ||
      !baseAssetReserves ||
      !decimalsBaseAsset ||
      !totalSupply
    ) {
      return;
    }
    return calculateBaseAssetNeededForPrincipalTokenIn(
      principalTokenInAmount,
      principalTokenReserves,
      baseAssetReserves,
      totalSupply,
      decimalsPrincipalToken,
      decimalsBaseAsset
    );
  }, [
    decimalsPrincipalToken,
    principalTokenInAmount,
    principalTokenReserves,
    decimalsBaseAsset,
    baseAssetReserves,
    totalSupply,
  ]);
}
