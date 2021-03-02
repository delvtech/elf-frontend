import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Elf, ERC20, Tranche } from "types";

import { MAX_ALLOWANCE } from "../maxAllowance";

export async function mintTrancheAssets(
  signer: Signer,
  baseAssetContract: ERC20,
  elfContract: Elf,
  trancheContract: Tranche,
  baseAssetAmountIn: string
) {
  const elementAddress = await signer.getAddress();
  // allow elf contract to take user's base asset tokens
  await baseAssetContract.approve(elfContract.address, MAX_ALLOWANCE);
  const baseAssetDecimals = await baseAssetContract.decimals();

  // deposit base asset into elf
  await elfContract.deposit(
    elementAddress,
    parseUnits(baseAssetAmountIn, baseAssetDecimals)
  );

  // allow tranche contract to take user's elf tokens
  await elfContract.approve(trancheContract.address, MAX_ALLOWANCE);

  const elfBalance = await elfContract.balanceOf(elementAddress);

  // deposit elf into tranche contract
  const depositTx = await trancheContract.deposit(elfBalance, elementAddress);
  await depositTx.wait(1);

  return depositTx;
}
