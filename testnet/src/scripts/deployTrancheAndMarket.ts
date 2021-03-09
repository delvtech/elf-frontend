import { Signer } from "ethers";
import { USDC } from "elf/types/USDC";
import { Vault } from "elf/types/Vault";
import { WETH } from "elf/types/WETH";

import { THIRTY_DAYS_IN_SECONDS } from "../time";
import { WeightedPoolFactory } from "elf/types/WeightedPoolFactory";
import { YVaultAssetProxy } from "elf/types/YVaultAssetProxy";
import { deployYieldPool } from "./deployYieldPool";
import { setupFYTMarket } from "./setupFYTMarket";
import { setupYCMarket } from "./setupYCMarket";
import { deployTranche } from "./tranche";

const defaultOptions = {
  swapFee: ".003",
  durationInSeconds: THIRTY_DAYS_IN_SECONDS,
};

export async function deployTrancheAndMarket(
  signer: Signer,
  yearnVaultAssetProxy: YVaultAssetProxy,
  baseAssetContract: WETH | USDC,
  balancerVaultContract: Vault,
  weightedPoolFactory: WeightedPoolFactory,
  options: {
    swapFee?: string;
    durationInSeconds?: number;
    baseAssetIn: string;
    yieldAssetIn: string;
    mintAmount: string;
  }
) {
  const {
    swapFee,
    durationInSeconds,
    baseAssetIn,
    yieldAssetIn,
    mintAmount,
  } = {
    ...defaultOptions,
    ...options,
  };

  // deploy a tranche
  const trancheContract = await deployTranche(
    signer,
    yearnVaultAssetProxy,
    durationInSeconds
  );

  // deploy an FYT market, seed with base asset
  const {
    poolId: fytPoolId,
    poolContract: fytPoolContract,
  } = await deployYieldPool(
    signer,
    balancerVaultContract,
    baseAssetContract,
    trancheContract,
    { swapFee, durationInSeconds }
  );

  // seed market with initial yield asset
  await setupFYTMarket(
    signer,
    balancerVaultContract,
    fytPoolId,
    baseAssetContract,
    trancheContract,
    { mintAmount, baseAssetIn, yieldAssetIn }
  );

  // now setup a yc market
  const {
    poolId: ycPoolId,
    poolContract: ycPoolContract,
  } = await setupYCMarket(
    signer,
    trancheContract,
    balancerVaultContract,
    baseAssetContract,
    weightedPoolFactory
  );

  return {
    trancheContract,
    fytPoolContract,
    fytPoolId,
    ycPoolContract,
    ycPoolId,
  };
}
