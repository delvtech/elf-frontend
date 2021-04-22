import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import {
  calculateLPOutGivenInUNSAFE,
  LPOutGivenTokenIn,
} from "efi/pools/calculateLPOutGivenIn";

export function calculatePrincipalTokenNeededForBaseAssetIn(
  principalTokenIn: number,
  principalTokenReserves: BigNumber,
  baseAssetReserves: BigNumber,
  totalSupply: BigNumber,
  decimalsPrincipalToken: number,
  decimalsBaseAsset: number
): LPOutGivenTokenIn {
  const principalTokenReservesNumber = +formatUnits(
    principalTokenReserves,
    decimalsPrincipalToken
  );
  const baseAssetReservesNumber = +formatUnits(
    baseAssetReserves,
    decimalsBaseAsset
  );
  const totalSupplyNumber = +formatUnits(
    totalSupply,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  return calculateLPOutGivenInUNSAFE(
    principalTokenIn,
    Number.MAX_SAFE_INTEGER,
    baseAssetReservesNumber,
    principalTokenReservesNumber,
    totalSupplyNumber
  );
}
