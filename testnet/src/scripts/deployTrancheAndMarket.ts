import { Signer } from "ethers";
import { USDC } from "types/USDC";
import { Vault } from "types/Vault";
import { WETH } from "types/WETH";

import { SIX_MONTHS_IN_SECONDS, THIRTY_DAYS_IN_SECONDS } from "../time";
import { WeightedPoolFactory } from "../types/WeightedPoolFactory";
import { YVaultAssetProxy } from "../types/YVaultAssetProxy";
import { deployYieldPool } from "./deployYieldPool";
import { setupFYTMarket } from "./setupFYTMarket";
import { setupYCMarket } from "./setupYCMarket";
import { deployTranche } from "./tranche";

const defaultOptions = {
  swapFee: ".003",
  duration: THIRTY_DAYS_IN_SECONDS,
};

export async function deployTrancheAndMarket(
  signer: Signer,
  yearnVaultAssetProxy: YVaultAssetProxy,
  baseAssetContract: WETH | USDC,
  balancerVaultContract: Vault,
  weightedPoolFactory: WeightedPoolFactory,
  options?: {
    swapFee: string;
    durationInSeconds: number;
  }
) {
  const { durationInSeconds } = { ...defaultOptions, ...options };

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
    options
  );

  // seed market with initial yield asset
  await setupFYTMarket(
    signer,
    balancerVaultContract,
    fytPoolId,
    baseAssetContract,
    trancheContract
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
