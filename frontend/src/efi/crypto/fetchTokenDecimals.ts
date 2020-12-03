import { BigNumber, Contract } from "ethers";

export async function fetchTokenDecimals(
  contract: Contract
): Promise<BigNumber> {
  return contract.decimals();
}
