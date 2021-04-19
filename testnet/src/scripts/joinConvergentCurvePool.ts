import abi from "ethereumjs-abi";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { Tranche } from "src/types/Tranche";
import { USDC } from "src/types/USDC";
import { Vault } from "src/types/Vault";
import { WETH } from "src/types/WETH";

/**
 * Stakes an initial amount of base asset into the ConvergentCurvePool
 *
 * @param poolId
 * @param signer
 * @param vaultContract
 * @param baseAssetContract
 * @param trancheContract
 * @param amountIn
 */
export async function joinConvergentCurvePool(
  poolId: string,
  signer: Signer,
  vaultContract: Vault,
  tokens: string[],
  baseAssetDecimals: number,
  maxAmountIn: string
) {
  const signerAddress = await signer.getAddress();
  const parseToken = (value: string) => parseUnits(value, baseAssetDecimals);

  // just do same amounts for each, balancer will figure out how much of each you need.
  const maxAmountsIn = [parseToken(maxAmountIn), parseToken(maxAmountIn)];
  const amounts = maxAmountsIn.map((amt) => amt.toHexString());

  // Whether or not to use balances held in balancer.  Since The Vault has nothing, set this to false.
  const fromInternalBalance = false;

  // Allow balancer pool to take user's fyt and base tokens
  // await baseAssetContract.approve(vaultContract.address, MAX_ALLOWANCE);
  // await trancheContract.approve(vaultContract.address, MAX_ALLOWANCE);

  // Balancer V2 vault allows userData as a way to pass props through to pool contracts.  In our
  // case we need to pass the maxAmountsIn.
  // TODO: switch to defaultAbiEncoder from ethers
  const userData = abi.rawEncode(["uint256[]"], [amounts]);

  console.log("aboot to join");
  const joinRequest = {
    assets: tokens,
    maxAmountsIn,
    userData,
    fromInternalBalance,
  };
  const joinReceipt = await vaultContract.joinPool(
    poolId,
    signerAddress,
    signerAddress,
    joinRequest
  );
  await joinReceipt.wait(1);
  return joinReceipt;
}
