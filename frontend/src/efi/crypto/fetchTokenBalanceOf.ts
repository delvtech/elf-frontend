import { Erc20 } from "elf-contracts/types/Erc20";
import { BigNumber } from "ethers";

export async function fetchTokenBalanceOf(
  contract: Erc20,
  account: string
): Promise<BigNumber> {
  return contract.balanceOf(account);
}
