import { Signer } from "ethers";

import { TestYVault__factory } from "src/types/factories/TestYVault__factory";

// TODO: update TestYVault to accept name/symbol
export async function deployYearnVault(
  signer: Signer,
  baseAssetAddress: string,
  name: string,
  symbol: string
) {
  const deployer = new TestYVault__factory(signer);
  return deployer.deploy(baseAssetAddress);
}
