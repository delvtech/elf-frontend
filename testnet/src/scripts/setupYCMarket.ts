import { Signer } from "ethers";
import { defaultAbiCoder, parseEther } from "ethers/lib/utils";
import { Tranche } from "types/Tranche";
import { USDC } from "types/USDC";
import { Vault } from "types/Vault";
import { WeightedPoolFactory } from "types/WeightedPoolFactory";
import { WETH } from "types/WETH";

import { MAX_ALLOWANCE } from "../maxAllowance";
import { YC__factory } from "../types/factories/YC__factory";
import { deployWeightedPool } from "./deployWeightedPool";

enum JoinKind {
  INIT,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
}

export async function setupYCMarket(
  signer: Signer,
  trancheContract: Tranche,
  balancerVaultContract: Vault,
  baseAssetContract: WETH | USDC,
  poolFactory: WeightedPoolFactory
) {
  const signerAddress = await signer.getAddress();
  // deploy an yc market
  const ycAddress = await trancheContract.yc();
  const ycContract = YC__factory.connect(ycAddress, signer);
  const ycMarketTokens = [baseAssetContract.address, ycAddress];
  const weights = [parseEther("1"), parseEther("10")];

  const { poolId, poolContract } = await deployWeightedPool(
    signer,
    balancerVaultContract,
    poolFactory,
    "Weth - ycWeth Pool",
    "ycWeth:WETH",
    ycMarketTokens,
    weights,
    "0.003"
  );

  await ycContract.approve(balancerVaultContract.address, MAX_ALLOWANCE);

  // this encodes the joinKind and the amountsIn.
  const userData = defaultAbiCoder.encode(
    ["uint8", "uint256[]"],
    [
      JoinKind.INIT,
      [parseEther("1000").toHexString(), parseEther("10000").toHexString()],
    ]
  );

  const maxAmountsIn = [parseEther("100000"), parseEther("10000")];

  const joinTxReceipt = await balancerVaultContract.joinPool(
    poolId,
    signerAddress,
    signerAddress,
    ycMarketTokens,
    maxAmountsIn,
    false,
    userData
  );

  await joinTxReceipt.wait(1);

  return {
    poolId,
    poolContract,
  };
}
