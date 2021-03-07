import { Signer } from "ethers";

import { AYVault__factory } from "../types/factories/AYVault__factory";

export async function deployYearnVault(
  signer: Signer,
  baseAssetAddress: string
) {
  const deployer = new AYVault__factory(signer);
  return deployer.deploy(baseAssetAddress);
}
