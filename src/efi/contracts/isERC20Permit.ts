import { ERC20Permit } from "@elementfi/core-typechain";
import { Contract } from "ethers";

export function isERC20Permit(
  contract: Contract | undefined
): contract is ERC20Permit {
  if (contract?.functions.permit) {
    return true;
  }
  return false;
}
