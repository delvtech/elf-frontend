import { Signer } from "ethers";

import { Tranche__factory, YVaultAssetProxy } from "../types";

export async function deployTranche(
  signer: Signer,
  elfContract: YVaultAssetProxy,
  durationInSeconds: number
) {
  const TrancheDeployer = new Tranche__factory(signer);
  const trancheContract = await TrancheDeployer.deploy(
    elfContract.address,
    durationInSeconds
  );

  return trancheContract;
}
