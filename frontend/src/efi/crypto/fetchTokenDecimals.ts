import { Erc20 } from "elf-contracts/types/Erc20";

export async function fetchTokenDecimals(contract: Erc20): Promise<number> {
  const result = await contract.decimals();
  return result;
}
