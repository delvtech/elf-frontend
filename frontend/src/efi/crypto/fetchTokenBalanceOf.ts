import { BigNumber, Contract } from "ethers";

export async function fetchTokenBalanceOf(
  contract: Contract,
  account: string
): Promise<BigNumber> {
  return contract.balanceOf(account);
}
