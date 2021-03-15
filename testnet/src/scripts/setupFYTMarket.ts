import { Signer } from "ethers";
import { ERC20 } from "src/types/ERC20";

import { Tranche } from "src/types/Tranche";
import { USDC } from "src/types/USDC";
import { Vault } from "src/types/Vault";
import { WETH } from "src/types/WETH";

import { batchSwapIn } from "./batchSwapIn";
import { initializeYieldPool } from "./initializeYieldPool";
import { mintTrancheAssets } from "./mintTrancheAssets";

// TODO: add options for the tranche and balancer pools
export async function setupFYTMarket(
  elementSigner: Signer,
  balancerVaultContract: Vault,
  poolId: string,
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche,
  options: { mintAmount: string; baseAssetIn: string; yieldAssetIn: string }
) {
  const { baseAssetIn, yieldAssetIn } = options;
  const sender = await elementSigner.getAddress();

  // put base asset into market
  await initializeYieldPool(
    poolId,
    elementSigner,
    balancerVaultContract,
    baseAssetContract,
    trancheContract,
    baseAssetIn
  );

  // mint some tranche assets
  await mintTrancheAssets(
    elementSigner,
    (baseAssetContract as unknown) as ERC20,
    trancheContract,
    baseAssetIn
  );

  // trade some tranche assets for some base assets
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
