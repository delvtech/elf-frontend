import { Signer } from "ethers";
import { defaultAbiCoder, parseEther, parseUnits } from "ethers/lib/utils";
import { Tranche } from "types/Tranche";
import { USDC } from "types/USDC";
import { Vault } from "types/Vault";
import { WeightedPoolFactory } from "types/WeightedPoolFactory";
import { WETH } from "types/WETH";

import { MAX_ALLOWANCE } from "../maxAllowance";
import { YC__factory } from "elf/types/factories/YC__factory";
import { deployWeightedPool } from "./deployWeightedPool";

// JoinKind from WeightedPool.sol
enum JoinKind {
  INIT,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT,
}

export async function setupYCMarket(
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

  // deploy an yc market
  const ycAddress = await trancheContract.yc();
  const ycContract = YC__factory.connect(ycAddress, signer);
  const ycMarketTokens = [baseAssetContract.address, ycAddress];
  const weights = [parseEther("1"), parseEther("10")];

  const { poolId, poolContract } = await deployWeightedPool(
    signer,
    balancerVaultContract,
    poolFactory,
    `Element ${baseAssetSymbol} - yc${baseAssetSymbol}`,
    `${baseAssetSymbol}-yc${baseAssetSymbol}`,
    ycMarketTokens,
    weights,
    "0.003"
  );

  await ycContract.approve(balancerVaultContract.address, MAX_ALLOWANCE);

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
    ycMarketTokens,
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
