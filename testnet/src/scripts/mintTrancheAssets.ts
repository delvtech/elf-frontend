import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ERC20 } from "types/ERC20";
import { Tranche } from "types/Tranche";

import { MAX_ALLOWANCE } from "../maxAllowance";

export async function mintTrancheAssets(
  signer: Signer,
  baseAssetContract: ERC20,
  trancheContract: Tranche,
  baseAssetAmountIn: string
) {
  const signerAddress = await signer.getAddress();

  // allow tranche contract to take user's base asset tokens
  await baseAssetContract.approve(trancheContract.address, MAX_ALLOWANCE);

  const baseAssetDecimals = await baseAssetContract.decimals();
  const baseAssetDeposit = parseUnits(baseAssetAmountIn, baseAssetDecimals);

  // deposit base asset into tranche contract
  const depositTx = await trancheContract.deposit(
    baseAssetDeposit,
    signerAddress
  );

  await depositTx.wait(1);

  return depositTx;
}
