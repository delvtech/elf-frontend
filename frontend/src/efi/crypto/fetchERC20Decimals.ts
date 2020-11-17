import { BigNumber, Contract } from "ethers";

export async function fetchERC20Decimals(
  contract: Contract,
  account: string
): Promise<BigNumber> {
  return contract.decimals(account);
}
