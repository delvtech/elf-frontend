import { Signer } from "ethers";
import { AYVault__factory } from "types";

export async function deployYearnVault(
  signer: Signer,
  baseAssetAddress: string
) {
  const deployer = new AYVault__factory(signer);
  return deployer.deploy(baseAssetAddress);
}
