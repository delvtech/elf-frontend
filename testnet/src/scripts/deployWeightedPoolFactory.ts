import { Signer } from "ethers";

import { Vault } from "../types";
import { WeightedPoolFactory__factory } from "../types/factories/WeightedPoolFactory__factory";

export async function deployWeightedPoolFactory(
  signer: Signer,
  balancerVaultContract: Vault
) {
  const balancerVaultAddress = balancerVaultContract.address;
  const deployer = new WeightedPoolFactory__factory(signer);
  const weightedPoolFactoryContract = await deployer.deploy(
    balancerVaultAddress
  );

  await weightedPoolFactoryContract.deployed();

  return weightedPoolFactoryContract;
}
