import { Signer } from "ethers";
import { USDC } from "types/USDC";
import { WETH } from "types/WETH";

import { USDC__factory } from "../types/factories/USDC__factory";
import { WETH__factory } from "../types/factories/WETH__factory";

export async function deployBaseAssets(signer: Signer): Promise<[WETH, USDC]> {
  const signerAddress = await signer.getAddress();

  const wethDeployer = new WETH__factory(signer);
  const wethContract = await wethDeployer.deploy(signerAddress);
  await wethContract.deployed();

  const usdcDeployer = new USDC__factory(signer);
  const usdcContract = await usdcDeployer.deploy(signerAddress);
  await usdcContract.deployed();

  return [wethContract, usdcContract];
}
