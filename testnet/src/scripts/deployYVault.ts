import { AYVault__factory } from "../types/factories/AYVault__factory";
import { Signer } from "ethers";

export async function deployYearnVault(
  signer: Signer,
  baseAssetAddress: string
) {
  const deployer = new AYVault__factory(signer);
  return deployer.deploy(baseAssetAddress);
}
