import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { BigNumber } from "ethers";

import { PoolSwapRequest } from "efi-ui/balancer/PoolSwapRequest";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { EMPTY_BYTES_LIKE } from "efi/base/bytes";
import { StaticContractMethodArgs } from "efi/contracts/types";

export function makeOnSwapGivenInCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenInAddress: string | undefined,
  amount: BigNumber | undefined,
  tokenOutAddress: string | undefined,
  balances: BigNumber[] | undefined,
  lastChangeBlock: number | undefined
): StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenInAddress ||
    !amount?.gt(0) ||
    !tokenOutAddress ||
    !balances?.length ||
    !lastChangeBlock
  ) {
    return undefined;
  }
  const swapRequest: PoolSwapRequest = {
    kind: SwapKind.GIVEN_IN,
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amount,
    poolId,
    lastChangeBlock,
    from: account,
    to: account,
    userData: EMPTY_BYTES_LIKE,
  };
  const callArgs: StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> = [
    swapRequest,
    balances[0],
    balances[1],
  ];

  return callArgs;
}
