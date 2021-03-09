import { Signer } from "ethers";

import {
  WeightedPoolFactory__factory,
} from "elf/types/factories/WeightedPoolFactory__factory";
import { Vault } from "elf/types/Vault";

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
