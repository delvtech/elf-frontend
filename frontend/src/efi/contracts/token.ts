import { Erc20 } from "elf-contracts/types/Erc20";
import { BigNumber, ContractTransaction, Signer } from "ethers";

/**
 * the erc20 allowance() method takes a unit256, therefore the max you can approve is 2^256 - 1
 */
const MAX_ALLOWANCE = BigNumber.from(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);

/**
 *
 * @param signer
 * @param assetContract the token contract to we want to approve
 * @param poolAddress the address to approve transfering tokens to
 * @param amount amount to approve, if no value given, approves the max value
 */
export async function postApprove(
  signer: Signer | undefined,
  assetContract: Erc20,
  poolAddress: string,
  amount?: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const allowance = amount ?? MAX_ALLOWANCE;
  const contractWithSigner = assetContract.connect(signer);
  return contractWithSigner.approve(poolAddress, allowance);
}
