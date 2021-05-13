import { Signer } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

import { USDC__factory } from "src/types/factories/USDC__factory";
import { WETH__factory } from "src/types/factories/WETH__factory";
import { USDC } from "src/types/USDC";
import { WETH } from "src/types/WETH";

export async function deployBaseAssets(
  wethSigner: Signer,
  usdcSigner: Signer
): Promise<[WETH, USDC]> {
  const wethSignerAddress = await wethSigner.getAddress();
  const usdcSignerAddress = await usdcSigner.getAddress();

  const wethDeployer = new WETH__factory(wethSigner);
  const wethContract = await wethDeployer.deploy(wethSignerAddress);
  await wethContract.deployed();
  // give weth contract some ETH for withdrawals
  await wethContract.deposit({ value: parseEther("900") });

  const usdcDeployer = new USDC__factory(usdcSigner);
  const usdcContract = await usdcDeployer.deploy(usdcSignerAddress);
  await usdcContract.deployed();

  return [wethContract, usdcContract];
}
