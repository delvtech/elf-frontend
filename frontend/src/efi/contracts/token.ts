import { Erc20 } from "elf-contracts/types/Erc20";
import { BigNumber, ContractTransaction, Signer } from "ethers";
import warning from "warning";

/**
 * the erc20 allowance() method takes a unit256, therefore the max you can approve is 2^256 - 1
 */
export const MAX_ALLOWANCE = BigNumber.from(
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
  signer: Signer,
  assetContract: Erc20,
  poolAddress: string,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  const isValidAmount = amount.gt(0) || amount.lte(MAX_ALLOWANCE);
  warning(
    isValidAmount,
    "Amount must be greater than zero and less than MAX_ALLOWANCE"
  );
  if (!isValidAmount) {
    return;
  }

  const contractWithSigner = assetContract.connect(signer);
  return contractWithSigner.approve(poolAddress, amount);
}

export async function fetchTokenAllowance(
  tokenContract: Erc20,
  ownerAddress: string,
  spenderAddress: string
): Promise<BigNumber | undefined> {
  return tokenContract.allowance(ownerAddress, spenderAddress);
}
