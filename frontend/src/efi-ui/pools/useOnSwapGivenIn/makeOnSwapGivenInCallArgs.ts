import { YieldCurvePool } from "elf-contracts/types";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import { StaticContractMethodArgs } from "efi/contracts/types";

export function makeOnSwapGivenInCallArgs(
  poolId: string,
  priceOfThisToken: ERC20,
  inThisToken: ERC20,
  balances: BigNumber[]
): StaticContractMethodArgs<YieldCurvePool, "onSwapGivenIn"> {
  return [
    {
      poolId,
      amountIn: 1,
      tokenIn: priceOfThisToken.address,
      tokenOut: inThisToken.address,

      // TODO: figure these args out
      from: "",
      to: "",
      latestBlockNumberUsed: 0,
      userData: "",
    },
    balances[0],
    balances[1],
  ];
}
