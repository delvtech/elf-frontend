import { ERC20 } from "elf-contracts/types/ERC20";
import { YieldCurvePool } from "elf-contracts/types/YieldCurvePool";
import { BigNumber } from "ethers";

import { StaticContractMethodArgs } from "efi/contracts/types";

export function makeOnSwapGivenInCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined,
  tokenOut: ERC20 | undefined,
  balances: BigNumber[] | undefined,
  latestBlockNumber: number | undefined
): StaticContractMethodArgs<YieldCurvePool, "onSwapGivenIn"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenIn ||
    !amount ||
    !tokenOut ||
    !balances?.length ||
    !latestBlockNumber
  ) {
    return undefined;
  }
  const callArgs: StaticContractMethodArgs<YieldCurvePool, "onSwapGivenIn"> = [
    {
      poolId: poolId,
      amountIn: amount,
      tokenIn: tokenIn?.address,
      tokenOut: tokenOut?.address,

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
