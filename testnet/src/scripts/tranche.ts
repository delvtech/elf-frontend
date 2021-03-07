import { Signer } from "ethers";
import { YVaultAssetProxy } from "types/YVaultAssetProxy";

import { Tranche__factory } from "../types/factories/Tranche__factory";

export async function deployTranche(
  signer: Signer,
  yearnVaultAssetProxy: YVaultAssetProxy,
  durationInSeconds: number
) {
  const TrancheDeployer = new Tranche__factory(signer);
  const trancheContract = await TrancheDeployer.deploy(
    yearnVaultAssetProxy.address,
    durationInSeconds
  );

  return trancheContract;
}
