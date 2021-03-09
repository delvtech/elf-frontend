import { Signer } from "ethers";

import { Tranche__factory } from "elf/types/factories/Tranche__factory";
import { YVaultAssetProxy } from "elf/types/YVaultAssetProxy";

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
