import abi from "ethereumjs-abi";
import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import hre from "hardhat";
import { Tranche, USDC, Vault, WETH } from "types";

import { MAX_ALLOWANCE } from "../maxAllowance";

export async function initializeYieldPool(
  poolId: string,
  elementSigner: Signer,
  vaultContract: Vault,
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche
) {
  const elementAddress = await elementSigner.getAddress();
  let [tokens] = await vaultContract.getPoolTokens(poolId);

  // TODO: make amounts configurable
  const maxAmountsIn = [parseEther("20000"), parseEther("20000")];
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
