import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { PoolSwapRequest } from "efi-ui/balancer/PoolSwapRequest";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { EMPTY_BYTES_LIKE } from "efi/base/bytes";
import { StaticContractMethodArgs } from "efi/contracts/types";

export function makeOnSwapGivenOutCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined,
  tokenOut: ERC20 | undefined,
  poolTokenBalances: BigNumber[] | undefined,
  lastChangeBlock: number | undefined
): StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenIn ||
    !amount ||
    !tokenOut ||
    !poolTokenBalances?.length ||
    !lastChangeBlock
  ) {
    return undefined;
  }
  const swapRequest: PoolSwapRequest = {
    kind: SwapKind.GIVEN_OUT,
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    amount,
    poolId,
    lastChangeBlock,
    from: account,
    to: account,
    userData: EMPTY_BYTES_LIKE,
  };
  const callArgs: StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> = [
    swapRequest,
    poolTokenBalances[0],
    poolTokenBalances[1],
  ];

  return callArgs;
}
