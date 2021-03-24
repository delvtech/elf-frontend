import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, ContractTransaction } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";

// TODO: make this a hook by converting to use useMutation?
export const swapExactAmountIn = async <
  ContractIn extends ERC20,
  ContractOut extends ERC20
>(
  amountIn: BigNumber | undefined,
  /* the spot price of the out token wrt to the in token */
  spotPrice: BigNumber | undefined,
  spotPriceAfter: BigNumber | undefined,
  /* number from 0 - 1, i.e. 0.001 for 0.1% slippage */
  slippage: number,
  tokenContractIn: ContractIn,
  tokenContractOut: ContractOut,
  /* must be signed */
  poolContract: PoolContract
): Promise<ContractTransaction | undefined> => {
  const tokenAddressIn = tokenContractIn?.address;
  const tokenAddressOut = tokenContractOut?.address;

  let amountOut: number | undefined;
  let minAmountOut: BigNumber | undefined;
  let maxPrice: BigNumber | undefined;

  if (amountIn && spotPrice) {
    amountOut = +formatEther(amountIn) / +formatEther(spotPrice);

    // multiply by 1 - slippage percent, i.e. 1 - 0.1% = .999
    const slippageDown = 1 - slippage;
    const _minAmountOut = amountOut * slippageDown;
    minAmountOut = parseEther(_minAmountOut.toString());

    // multiply by 1 + slippage percent, i.e. 1 + 0.1% = 1.001
    const slippageUp = 1 + slippage;
    const _maxPrice = +formatEther(spotPrice) * slippageUp;

    maxPrice = parseEther(_maxPrice.toString());
  }

  // TODO: we need to handle this error.  We should disable the trade button with a warning that
  // there would be too much slippage.
  if (maxPrice && spotPriceAfter && spotPriceAfter.gt(maxPrice)) {
    console.error("Too much slippage, cant execute transaction");
  }

  const callArgs = [
    tokenAddressIn,
    amountIn,
    tokenAddressOut,
    minAmountOut,
    maxPrice,
  ] as ContractMethodArgs<PoolContract, "swapExactAmountIn">;

  if (!poolContract) {
    return;
  }

  const txInReceipt = await poolContract.swapExactAmountIn(...callArgs);
  await txInReceipt.wait(1);
  return txInReceipt;
};
