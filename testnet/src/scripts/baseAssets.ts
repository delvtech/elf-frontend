import { USDC__factory } from "elf/types/factories/USDC__factory";
import { WETH__factory } from "elf/types/factories/WETH__factory";
import { USDC } from "elf/types/USDC";
import { WETH } from "elf/types/WETH";
import { Signer } from "ethers";

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
