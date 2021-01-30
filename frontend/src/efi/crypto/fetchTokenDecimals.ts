import { ERC20 } from "elf-contracts/types/ERC20";

export async function fetchTokenDecimals(contract: ERC20): Promise<number> {
  const result = await contract.decimals();
  return result;
}
