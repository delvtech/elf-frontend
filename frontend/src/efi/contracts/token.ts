import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { BigNumber, ContractTransaction, ethers, Signer } from "ethers";
import warning from "warning";

/**
 *
 * @param signer
 * @param assetContract the token contract to we want to approve
 * @param poolAddress the address to approve transfering tokens to
 * @param amount amount to approve, if no value given, approves the max value
 */
export async function postApprove(
  signer: Signer,
  assetContract: ERC20,
  poolAddress: string,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  const isValidAmount = amount.gt(0) || amount.lte(ethers.constants.MaxUint256);
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
  tokenContract: ERC20,
  ownerAddress: string,
  spenderAddress: string
): Promise<BigNumber | undefined> {
  return tokenContract.allowance(ownerAddress, spenderAddress);
}
