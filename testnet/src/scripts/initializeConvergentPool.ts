import abi from "ethereumjs-abi";
import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { MAX_ALLOWANCE } from "src/maxAllowance";
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
export async function initializeConvergentPool(
  poolId: string,
  signer: Signer,
  vaultContract: Vault,
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche,
  amountIn: string
) {
  const elementAddress = await signer.getAddress();
  let { tokens } = await vaultContract.getPoolTokens(poolId);

  // [baseAsset, yieldAsset] Max amount for each asset to join the pool with. note that the yield
  // asset amount doesn't matter for the first joinPool action for convergent pools since the
  // initial join only allows base asset.  this has something to do with the way we keep track of
  // the yield asset price based off of swaps.  to initialize the pool with yield asset we need to
  // follow up the joinPool by swapping in some yield asset for some base asset.
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
