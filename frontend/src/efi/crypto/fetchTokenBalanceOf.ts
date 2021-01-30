import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

export async function fetchTokenBalanceOf(
  contract: Erc20,
  account: string
): Promise<BigNumber> {
  return contract.balanceOf(account);
}
