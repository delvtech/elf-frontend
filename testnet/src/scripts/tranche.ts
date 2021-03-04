import { Signer } from "ethers";

import { Tranche__factory, YVaultAssetProxy } from "../types";

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
