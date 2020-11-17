import { BigNumber, Contract } from "ethers";

export async function fetchERC20Balance(
  contract: Contract,
  account: string
): Promise<BigNumber> {
  return contract.balanceOf(account);
}
