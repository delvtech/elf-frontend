import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { StaticContractMethodArgs } from "efi/contracts/types";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";

export function makeOnSwapGivenOutCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined,
  tokenOut: ERC20 | undefined,
  poolTokenBalances: BigNumber[] | undefined,
  latestBlockNumber: number | undefined
): StaticContractMethodArgs<ConvergentCurvePool, "onSwapGivenOut"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenIn ||
    !amount ||
    !tokenOut ||
    !poolTokenBalances?.length ||
    !latestBlockNumber
  ) {
    return undefined;
  }
  const callArgs: StaticContractMethodArgs<
    ConvergentCurvePool,
    "onSwapGivenOut"
  > = [
    {
      poolId: poolId,
      amountOut: amount,
      tokenIn: tokenIn?.address,
      tokenOut: tokenOut?.address,

      from: account,
      to: account,
      latestBlockNumberUsed: latestBlockNumber,
      userData: poolId,
    },
    poolTokenBalances[0],
    poolTokenBalances[1],
  ];

  return callArgs;
}
