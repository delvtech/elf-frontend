import { YieldCurvePool } from "elf-contracts/types";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import { StaticContractMethodArgs } from "efi/contracts/types";

export function makeOnSwapGivenInCallArgs(
  poolId: string | undefined,
  tokenIn: ERC20 | undefined,
  amount: BigNumber | undefined,
  tokenOut: ERC20 | undefined,
  balances: BigNumber[] | undefined
): StaticContractMethodArgs<YieldCurvePool, "onSwapGivenIn"> | undefined {
  const isEnabled = [poolId, tokenIn, amount, tokenOut, balances?.length].every(
    (v) => !!v
  );
  if (!isEnabled) {
    return undefined;
  }
  return [
    {
      poolId: poolId as string,
      amountIn: amount as BigNumber,
      tokenIn: tokenIn?.address as string,
      tokenOut: tokenOut?.address as string,

      // TODO: figure these args out
      from: "",
      to: "",
      latestBlockNumberUsed: 0,
      userData: "",
    },
    balances?.[0] as BigNumber,
    balances?.[1] as BigNumber,
  ];
}
