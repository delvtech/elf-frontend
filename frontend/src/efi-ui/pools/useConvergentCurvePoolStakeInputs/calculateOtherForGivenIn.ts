import { formatUnits } from "ethers/lib/utils";
import { calculateLPOutGivenIn } from "efi/pools/calculateLPOutGivenIn";
import { BigNumber } from "ethers";
import { BALANCER_POOL_TOTAL_SUPPLY_DECIMALS } from "efi-balancer/pools";

export function calculateOtherForGivenIn(
  givenInNumber: number,
  givenInReserves: BigNumber,
  otherReserves: BigNumber,
  totalSupply: BigNumber,
  givenInDecimals: number,
  otherDecimals: number
): number | undefined {
  const givenInReservesNumber = +formatUnits(givenInReserves, givenInDecimals);
  const otherReservesNumber = +formatUnits(otherReserves, otherDecimals);
  const totalSupplyNumber = +formatUnits(
    totalSupply,
    BALANCER_POOL_TOTAL_SUPPLY_DECIMALS
  );

  const { otherNeeded } = calculateLPOutGivenIn(
    givenInNumber,
    Number.MAX_SAFE_INTEGER,
    givenInReservesNumber,
    otherReservesNumber,
    totalSupplyNumber
  );
  return otherNeeded;
}
