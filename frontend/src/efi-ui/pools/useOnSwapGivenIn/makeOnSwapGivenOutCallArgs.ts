import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { StaticContractMethodArgs } from "efi/contracts/types";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { PoolSwapRequest } from "efi-ui/balancer/PoolSwapRequest";
import { SwapKind } from "efi-ui/balancer/SwapKind";

export function makeOnSwapGivenOutCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined,
  tokenOut: ERC20 | undefined,
  poolTokenBalances: BigNumber[] | undefined,
  latestBlockNumberUsed: number | undefined
): StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenIn ||
    !amount ||
    !tokenOut ||
    !poolTokenBalances?.length ||
    !latestBlockNumberUsed
  ) {
    return undefined;
  }
  const swapRequest: PoolSwapRequest = {
    kind: SwapKind.GIVEN_OUT,
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    amount,
    poolId,
    latestBlockNumberUsed,
    from: account,
    to: account,
    userData: "0x",
  };
  const callArgs: StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> = [
    swapRequest,
    poolTokenBalances[0],
    poolTokenBalances[1],
  ];

  return callArgs;
}
