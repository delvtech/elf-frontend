import { BigNumber, Contract } from "ethers";

export async function fetchERC20Decimals(
  contract: Contract
): Promise<BigNumber> {
  return contract.decimals();
}
