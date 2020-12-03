import { BigNumber, Contract } from "ethers";

export async function fetchERC20BalanceOf(
  contract: Contract,
  account: string
): Promise<BigNumber> {
  return contract.balanceOf(account);
}
