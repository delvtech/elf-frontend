import { Signer } from "ethers";
import { ERC20 } from "src/types/ERC20";

import { Tranche } from "src/types/Tranche";
import { USDC } from "src/types/USDC";
import { Vault } from "src/types/Vault";
import { WETH } from "src/types/WETH";

import { batchSwapIn } from "./batchSwapIn";
import { initializeConvergentPool } from "./initializeConvergentPool";
import { mintTrancheAssets } from "./mintTrancheAssets";

export async function setupPrincipalTokenPool(
  signer: Signer,
  balancerVaultContract: Vault,
  poolId: string,
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche,
  options: { mintAmount: string; baseAssetIn: string; yieldAssetIn: string }
) {
  const { baseAssetIn, yieldAssetIn } = options;
  const sender = await signer.getAddress();

  // put base asset into market
  console.log("--initializeConvergentPool");
  await initializeConvergentPool(
    poolId,
    signer,
    balancerVaultContract,
    baseAssetContract,
    trancheContract,
    baseAssetIn
  );

  // mint some tranche assets
  console.log("--mintTrancheAssets");
  await mintTrancheAssets(
    signer,
    baseAssetContract,
    trancheContract,
    baseAssetIn
  );

  // trade some tranche assets for some base assets
  console.log("--batchSwapIn");
  const swapReceipt = await batchSwapIn(
    trancheContract,
    (baseAssetContract as unknown) as ERC20,
    poolId,
    sender,
    balancerVaultContract,
    yieldAssetIn
  );

  await swapReceipt.wait(1);
  return swapReceipt;
}
