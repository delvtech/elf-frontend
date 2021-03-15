import { Signer } from "ethers";

import { TrancheFactory__factory } from "src/types/factories/TrancheFactory__factory";
import { InterestTokenFactory } from "src/types/InterestTokenFactory";

export async function deployTrancheFactory(
  signer: Signer,
  interestTokenFactoryContract: InterestTokenFactory
) {
  const interestTokenFactoryAddress = interestTokenFactoryContract.address;
  const trancheFactoryDeployer = new TrancheFactory__factory(signer);
  const trancheFactoryContract = await trancheFactoryDeployer.deploy(
    interestTokenFactoryAddress
  );

  await trancheFactoryContract.deployed();

  return trancheFactoryContract;
}
