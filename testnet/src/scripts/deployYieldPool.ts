import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { ERC20 } from "src/types/ERC20";
import {
  YieldCurvePool__factory,
} from "src/types/factories/YieldCurvePool__factory";
import { USDC } from "src/types/USDC";
import { Vault } from "src/types/Vault";
import { WETH } from "src/types/WETH";

import { THIRTY_DAYS_IN_SECONDS } from "../time";

const defaultOptions = {
  swapFee: ".003",
  durationInSeconds: THIRTY_DAYS_IN_SECONDS,
};

export async function deployYieldPool(
  elementSigner: Signer,
  vaultContract: Vault,
  baseAssetContract: WETH | USDC,
  yieldAssetContract: ERC20,
  options?: {
    swapFee: string;
    durationInSeconds: number;
  }
) {
  const { swapFee, durationInSeconds } = { ...defaultOptions, ...options };
  const elementAddress = await elementSigner.getAddress();
  const baseAssetSymbol = await baseAssetContract.symbol();
  const yieldPoolDeployer = new YieldCurvePool__factory(elementSigner);

  const dateInMilliseconds = Date.now();
  const dateInSeconds = dateInMilliseconds / 1000;
  const expiration = Math.round(dateInSeconds + durationInSeconds);

  const poolContract = await yieldPoolDeployer.deploy(
    baseAssetContract.address,
    yieldAssetContract.address,
    expiration,
    durationInSeconds,
    vaultContract.address,
    parseEther(swapFee),
    elementAddress,
    `Element ${baseAssetSymbol} - fy${baseAssetSymbol}`,
    `${baseAssetSymbol}-fy${baseAssetSymbol}`
  );

  // grab last poolId from last event
  const newPools = vaultContract.filters.PoolCreated(null);
  const results = await vaultContract.queryFilter(newPools);
  const poolIds: string[] = results.map((result) => result.args?.poolId);
  const poolId = poolIds[poolIds.length - 1];

  return { poolId, poolContract };
}
