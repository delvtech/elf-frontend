import { Signer } from "ethers";

import { YVaultAssetProxy__factory } from "../types/factories/YVaultAssetProxy__factory";

export async function deployYearnVaultAssetProxy(
  signer: Signer,
  yUnderlying: string,
  underlying: string,
  name: string,
  symbol: string
) {
  const deployer = new YVaultAssetProxy__factory(signer);
  return await deployer.deploy(yUnderlying, underlying, name, symbol);
}
