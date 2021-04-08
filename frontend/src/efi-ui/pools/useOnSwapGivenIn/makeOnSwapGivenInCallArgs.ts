import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { BigNumber } from "ethers";

import { StaticContractMethodArgs } from "efi/contracts/types";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { PoolSwapRequest } from "efi-ui/balancer/PoolSwapRequest";

// swapRequest: {
//   kind: BigNumberish;
//   tokenIn: string;
//   tokenOut: string;
//   amount: BigNumberish;
//   poolId: BytesLike;
//   latestBlockNumberUsed: BigNumberish;
//   from: string;
//   to: string;
//   userData: BytesLike;
// },
// currentBalanceTokenIn: BigNumberish,
// currentBalanceTokenOut: BigNumberish,
export function makeOnSwapGivenInCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  tokenInAddress: string | undefined,
  amount: BigNumber | undefined,
  tokenOutAddress: string | undefined,
  balances: BigNumber[] | undefined,
  latestBlockNumberUsed: number | undefined
): StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> | undefined {
  if (
    !account ||
    !poolId ||
    !tokenInAddress ||
    !amount?.gt(0) ||
    !tokenOutAddress ||
    !balances?.length ||
    !latestBlockNumberUsed
  ) {
    return undefined;
  }
  const swapRequest: PoolSwapRequest = {
    kind: SwapKind.GIVEN_IN,
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amount,
    poolId,
    latestBlockNumberUsed,
    from: account,
    to: account,
    userData: "0x",
  };
  const callArgs: StaticContractMethodArgs<ConvergentCurvePool, "onSwap"> = [
    swapRequest,
    balances[0],
    balances[1],
  ];

  return callArgs;
}
