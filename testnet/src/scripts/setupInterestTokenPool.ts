import { BigNumber, Signer } from "ethers";
import { defaultAbiCoder, parseEther, parseUnits } from "ethers/lib/utils";
import { MAX_ALLOWANCE } from "src/maxAllowance";
import { InterestToken__factory } from "src/types/factories/InterestToken__factory";

import { Tranche } from "src/types/Tranche";
import { USDC } from "src/types/USDC";
import { Vault } from "src/types/Vault";
import { WeightedPoolFactory } from "src/types/WeightedPoolFactory";
import { WETH } from "src/types/WETH";

import { deployWeightedPool } from "./deployWeightedPool";

// JoinKind from WeightedPool.sol
enum JoinKind {
  INIT,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT,
}

export async function setupInterestTokenPool(
  signer: Signer,
  trancheContract: Tranche,
  balancerVaultContract: Vault,
  baseAssetContract: WETH | USDC,
  poolFactory: WeightedPoolFactory
) {
  const signerAddress = await signer.getAddress();
  const baseAssetSymbol = await baseAssetContract.symbol();
  const baseAssetDecimals = await baseAssetContract.decimals();
  const parseToken = (value: string) => parseUnits(value, baseAssetDecimals);

  // deploy an interest token pool
  const interestTokenAddress = await trancheContract.interestToken();
  console.log("interestTokenAddress", interestTokenAddress);
  const interestTokenContract = InterestToken__factory.connect(
    interestTokenAddress,
    signer
  );

  const interestTokenValue = BigNumber.from(interestTokenAddress);
  const baseAssetValue = BigNumber.from(baseAssetContract.address);

  let poolTokens: string[];
  let weights: BigNumber[];
  if (interestTokenValue.lt(baseAssetValue)) {
    poolTokens = [interestTokenAddress, baseAssetContract.address];
    weights = [parseEther("10"), parseEther("1")];
  } else {
    poolTokens = [baseAssetContract.address, interestTokenAddress];
    weights = [parseEther("1"), parseEther("10")];
  }

  const { poolId, poolContract } = await deployWeightedPool(
    signer,
    balancerVaultContract,
    poolFactory,
    `Element ${baseAssetSymbol} - yc${baseAssetSymbol}`,
    `${baseAssetSymbol}-yc${baseAssetSymbol}`,
    poolTokens,
    weights,
    "0.003"
  );

  await interestTokenContract.approve(
    balancerVaultContract.address,
    MAX_ALLOWANCE
  );

  // this encodes the joinKind and the amountsIn.
  const userData = defaultAbiCoder.encode(
    ["uint8", "uint256[]"],
    [
      JoinKind.INIT,
      [parseToken("1000").toHexString(), parseToken("10000").toHexString()],
    ]
  );

  // the amounts to put in.  they are 'max' because pools will figure out the exact ratio's required
  // for the pool's weight requirements.
  const maxAmountsIn = [parseToken("100000"), parseToken("10000")];

  const joinTxReceipt = await balancerVaultContract.joinPool(
    poolId,
    signerAddress,
    signerAddress,
    poolTokens,
    maxAmountsIn,
    false,
    userData
  );

  await joinTxReceipt.wait(1);

  return {
    poolId,
    poolContract,
  };
}
