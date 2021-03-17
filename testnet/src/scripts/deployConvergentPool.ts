import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { ConvergentPoolFactory } from "src/types/ConvergentPoolFactory";
import { ERC20 } from "src/types/ERC20";
import { ConvergentCurvePool__factory } from "src/types/factories/ConvergentCurvePool__factory";
import { USDC } from "src/types/USDC";
import { Vault } from "src/types/Vault";
import { WETH } from "src/types/WETH";

import { THIRTY_DAYS_IN_SECONDS } from "src/time";

const defaultOptions = {
  swapFee: ".003",
  durationInSeconds: THIRTY_DAYS_IN_SECONDS,
};

export async function deployConvergentPool(
  signer: Signer,
  convergentPoolFactory: ConvergentPoolFactory,
  balancerVaultContract: Vault,
  baseAssetContract: WETH | USDC,
  yieldAssetContract: ERC20,
  options?: {
    swapFee: string;
    durationInSeconds: number;
  }
) {
  const { swapFee, durationInSeconds } = { ...defaultOptions, ...options };
  const baseAssetSymbol = await baseAssetContract.symbol();

  const dateInMilliseconds = Date.now();
  const dateInSeconds = dateInMilliseconds / 1000;
  const expiration = Math.round(dateInSeconds + durationInSeconds);

  const createTx = await convergentPoolFactory.create(
    baseAssetContract.address,
    yieldAssetContract.address,
    expiration,
    durationInSeconds,
    parseEther(swapFee),
    `Element ${baseAssetSymbol} - fy${baseAssetSymbol}`,
    `${baseAssetSymbol}-fy${baseAssetSymbol}`
  );
  await createTx.wait(1);

  // grab last poolId from last event
  const newPools = balancerVaultContract.filters.PoolRegistered(null);
  const results = await balancerVaultContract.queryFilter(newPools);
  const poolIds: string[] = results.map((result) => result.args?.poolId);
  const poolId = poolIds[poolIds.length - 1];

  const [poolAddress] = await balancerVaultContract.getPool(poolId);
  const poolContract = ConvergentCurvePool__factory.connect(
    poolAddress,
    signer
  );
  const decimals = await poolContract.decimals();
  const udecimals = await poolContract.underlyingDecimals();
  const bdecimals = await poolContract.bondDecimals();
  console.log("decimals", decimals);
  console.log("udecimals", udecimals);
  console.log("bdecimals", bdecimals);

  return { poolId, poolContract };
}
