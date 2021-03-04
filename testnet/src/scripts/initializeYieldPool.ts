import abi from "ethereumjs-abi";
import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { Tranche, USDC, Vault, WETH } from "types";

import { MAX_ALLOWANCE } from "../maxAllowance";

/**
 * Stakes an initial amount of base asset into the YieldPool
 *
 * @param poolId
 * @param elementSigner
 * @param vaultContract
 * @param baseAssetContract
 * @param trancheContract
 * @param amountIn
 */
export async function initializeYieldPool(
  poolId: string,
  elementSigner: Signer,
  vaultContract: Vault,
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche,
  amountIn: string
) {
  const elementAddress = await elementSigner.getAddress();
  let { tokens } = await vaultContract.getPoolTokens(poolId);

  // we can only initialize the pool with base asset, the yield asset is ignored.
  const maxAmountsIn = [parseEther(amountIn), parseEther(amountIn)];
  const amounts = maxAmountsIn.map((amt) => amt.toHexString());

  // Whether or not to use balances held in balancer.  Since The Vault has nothing, set this to false.
  const fromInternalBalance = false;

  // Allow balancer pool to take user's fyt and base tokens
  await baseAssetContract.approve(vaultContract.address, MAX_ALLOWANCE);
  await trancheContract.approve(vaultContract.address, MAX_ALLOWANCE);

  // Balancer V2 vault allows userData as a way to pass props through to pool contracts.  In our
  // case we need to pass the maxAmountsIn.
  const userData = abi.rawEncode(["uint256", "uint256"], amounts);

  const joinReceipt = await vaultContract.joinPool(
    poolId,
    elementAddress,
    elementAddress,
    tokens,
    maxAmountsIn,
    fromInternalBalance,
    userData
  );
  await joinReceipt.wait(1);
  return joinReceipt;
}
