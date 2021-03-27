import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { BigNumber } from "ethers";

import { StaticContractMethodArgs } from "efi/contracts/types";

export function makeOnSwapGivenInCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenInAddress: string | undefined,
  amount: BigNumber | undefined,
  tokenOutAddress: string | undefined,
  balances: BigNumber[] | undefined,
  latestBlockNumber: number | undefined
): StaticContractMethodArgs<ConvergentCurvePool, "onSwapGivenIn"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenInAddress ||
    !amount ||
    !tokenOutAddress ||
    !balances?.length ||
    !latestBlockNumber
  ) {
    return undefined;
  }
  const callArgs: StaticContractMethodArgs<
    ConvergentCurvePool,
    "onSwapGivenIn"
  > = [
    {
      poolId: poolId,
      amountIn: amount,
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,

      from: account,
      to: account,
      latestBlockNumberUsed: latestBlockNumber,
      userData: poolId,
    },
    balances[0],
    balances[1],
  ];

  return callArgs;
}
