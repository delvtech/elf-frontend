import { Contract, Signer } from "ethers";
import { UserProxy } from "elf/types/UserProxy";

import { UserProxy__factory } from "elf/types/factories/UserProxy__factory";

export async function deployUserProxy<T extends Contract>(
  signer: Signer,
  wethAddress: string
): Promise<UserProxy> {
  const UserProxyDeployer = new UserProxy__factory(signer);
  const userProxyContract = (await UserProxyDeployer.deploy(
    wethAddress
  )) as UserProxy;

  return userProxyContract;
}
