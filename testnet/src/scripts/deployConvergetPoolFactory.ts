import { Signer } from "ethers";

import { ConvergentPoolFactory__factory } from "src/types/factories/ConvergentPoolFactory__factory";
import { Vault } from "src/types/Vault";

export async function deployConvergentPoolFactory(
  signer: Signer,
  balancerVaultContract: Vault
) {
  const signerAddress = await signer.getAddress();
  const convergentPoolFactoryDeployer = new ConvergentPoolFactory__factory(
    signer
  );
  const convergentPoolFactoryContract = await convergentPoolFactoryDeployer.deploy(
    balancerVaultContract.address,
    signerAddress
  );
  await convergentPoolFactoryContract.deployed();

  return convergentPoolFactoryContract;
}
