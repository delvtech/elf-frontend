import { BPool } from "elf-contracts/types/BPool";
import { BigNumber } from "ethers";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ContractMethodArgs } from "efi/contracts/types";
import { ERC20 } from "elf-contracts/types/ERC20";

export const useCalcOutGivenIn = <
  ContractIn extends ERC20,
  ContractOut extends ERC20
>(
  amountIn: BigNumber | undefined,
  tokenContractIn: ContractIn | undefined,
  tokenContractOut: ContractOut | undefined,
  poolContract: BPool | undefined
) => {
  const tokenAddressIn = tokenContractIn?.address;
  const tokenAddressOut = tokenContractOut?.address;

  const { data: tokenWeightIn } = useSmartContractReadCall(
    poolContract,
    "getDenormalizedWeight",
    { callArgs: [tokenAddressIn as string], enabled: !!tokenAddressIn }
  );

  const { data: tokenWeightOut } = useSmartContractReadCall(
    poolContract,
    "getDenormalizedWeight",
    { callArgs: [tokenAddressOut as string], enabled: !!tokenAddressOut }
  );

  const { data: tokenBalanceIn } = useSmartContractReadCall(
    poolContract,
    "getBalance",
    {
      callArgs: [tokenAddressIn as string],
      enabled: !!tokenAddressIn,
    }
  );

  const { data: tokenBalanceOut } = useSmartContractReadCall(
    poolContract,
    "getBalance",
    {
      callArgs: [tokenAddressOut as string],
      enabled: !!tokenAddressOut,
    }
  );

  const { data: swapFee } = useSmartContractReadCall(
    poolContract,
    "getSwapFee"
  );

  const callArgs = [
    tokenBalanceIn,
    tokenWeightIn,
    tokenBalanceOut,
    tokenWeightOut,
    amountIn,
    swapFee,
  ] as ContractMethodArgs<BPool, "calcOutGivenIn">;

  const calcOutResult = useSmartContractReadCall(
    poolContract,
    "calcOutGivenIn",
    {
      callArgs,
      enabled: callArgs.every((callArg) => !!callArg),
    }
  );

  return calcOutResult;
};
