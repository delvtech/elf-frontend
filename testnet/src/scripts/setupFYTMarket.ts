import { Signer } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Tranche } from "types/Tranche";
import { USDC } from "types/USDC";
import { Vault } from "types/Vault";
import { WETH } from "types/WETH";

import { ERC20__factory } from "../types/factories/ERC20__factory";
import { YC__factory } from "../types/factories/YC__factory";
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
    baseAssetContract,
    trancheContract,
    baseAssetIn
  );
  const fytDecimals = await trancheContract.decimals();
  const yc = await trancheContract.yc();
  const ycContract = YC__factory.connect(yc, elementSigner);
  const ycDecimals = await ycContract.decimals();

  // trade some tranche assets for some base assets
  const swapReceipt = await batchSwapIn(
    trancheContract,
    baseAssetContract,
    poolId,
    sender,
    balancerVaultContract,
    yieldAssetIn
  );

  await swapReceipt.wait(1);
  return swapReceipt;
}
