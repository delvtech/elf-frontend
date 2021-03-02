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
  trancheWethContract: Tranche
) {
  const elementAddress = await elementSigner.getAddress();
  let [tokens, balances] = await vaultContract.getPoolTokens(poolId);
  console.log("baseAssetContract", baseAssetContract.address);
  console.log("trancheWethContract", trancheWethContract.address);
  console.log("baseAssetContract", await baseAssetContract.name());
  console.log("trancheWethContract", await trancheWethContract.name());

  console.log("Pool tokens should have zero balances.");
  console.log("tokens", tokens);
  console.log("balances", balances);
  const weth = await hre.ethers.getContractAt("WETH", tokens[0]);
  const fyweth = await hre.ethers.getContractAt("WETH", tokens[0]);
  const wethName = await weth.name();
  const fyName = await fyweth.name();
  console.log("wethName", wethName);
  console.log("fyName", fyName);

  const maxAmountsIn = [parseEther("9500"), parseEther("10000")];
  const amounts = maxAmountsIn.map((amt) => amt.toHexString());

  // Whether or not to use balances held in balancer.  Since The Vault has nothing, set this to false.
  const fromInternalBalance = false;

  // Allow balancer pool to take user's fyt and base tokens
  await baseAssetContract.approve(vaultContract.address, MAX_ALLOWANCE);
  await trancheWethContract.approve(vaultContract.address, MAX_ALLOWANCE);

  // Balancer V2 vault allows userData as a way to pass props through to pool contracts.  In our
  // case we need to pass the maxAmountsIn.
  const userData = abi.rawEncode(["uint256", "uint256"], amounts);

  // const encodedPoolId: Buffer = abi.rawEncode(["bytes32"], [poolId]);
  // console.log("encodedPoolId", encodedPoolId);
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

  // check price
  // marketWethFYTV2Contract.onSwapGivenIn(tuple, uint256, uint256);

  [tokens, balances] = await vaultContract.getPoolTokens(poolId);

  console.log("Pool tokens should have initial balances.");
  console.log("tokens", tokens);
  console.log("balances", balances);

  return joinReceipt;
}
