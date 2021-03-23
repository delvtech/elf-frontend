import { Signer } from "ethers";
import { Tranche__factory } from "src/types/factories/Tranche__factory";
import { TrancheFactory } from "src/types/TrancheFactory";
import { YVaultAssetProxy } from "src/types/YVaultAssetProxy";

export async function deployTranche(
  signer: Signer,
  trancheFactoryContract: TrancheFactory,
  yearnVaultAssetProxy: YVaultAssetProxy,
  expirationTimeInUnixSeconds: number
) {
  const txReceipt = await trancheFactoryContract.deployTranche(
    expirationTimeInUnixSeconds,
    yearnVaultAssetProxy.address
  );
  await txReceipt.wait(1);

  const queryFilter = trancheFactoryContract.filters.TrancheCreated(
    null,
    yearnVaultAssetProxy.address,
    null
  );
  const trancheEvents = await trancheFactoryContract.queryFilter(queryFilter);
  const trancheAddress: string =
    trancheEvents[trancheEvents.length - 1].args?.trancheAddress;
  const trancheContract = Tranche__factory.connect(trancheAddress, signer);
  return trancheContract;
}
