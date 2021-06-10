import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import hre from "hardhat";

import { MAX_ALLOWANCE } from "src/maxAllowance";
import { exitConvergentCurvePool } from "src/helpers/exitConvergentCurvePool";
import { getContracts } from "src/scripts/getContracts";
import { getSigner, SIGNER } from "src/scripts/getSigner";
import { joinConvergentCurvePool } from "src/helpers/joinConvergentCurvePool";
import { printSpotPriceForPool } from "src/scripts/printSpotPriceForPool";
import { printTokenInfoForPool } from "src/scripts/printTokenInfoForPool";

async function simpleJoins() {
  const trader1 = await getSigner(SIGNER.TRADER1, hre);
  const {
    balancerVaultContract,
    wethContract: baseAssetContract,
    wethTrancheContract: trancheContract,
    marketFyWethContract: ptPoolContract,
    // TODO: make the baseAsset or pool configurable for this script
    // usdcContract: baseAssetContract,
    // usdcTrancheContract: trancheContract,
    // marketFyUsdcContract: ptPoolContract,
    userProxyContract,
  } = getContracts(hre, trader1);

  const trader1Address = await trader1.getAddress();

  await baseAssetContract.approve(balancerVaultContract.address, MAX_ALLOWANCE);
  await trancheContract.approve(balancerVaultContract.address, MAX_ALLOWANCE);
  const baseAssetDecimals = await baseAssetContract.decimals();
  await baseAssetContract.mint(
    trader1Address,
    parseUnits("10000000", baseAssetDecimals)
  );

  const poolId = await ptPoolContract.getPoolId();
  const { tokens } = await balancerVaultContract.getPoolTokens(poolId);
  await printTokenInfoForPool(balancerVaultContract, poolId, trader1);

  await baseAssetContract.approve(userProxyContract.address, MAX_ALLOWANCE);
  const expiration = await trancheContract.unlockTimestamp();
  const position = await trancheContract.position();

  const mintTx = await userProxyContract.mint(
    parseUnits("10000", baseAssetDecimals),
    baseAssetContract.address,
    expiration,
    position,
    []
  );
  await mintTx.wait(1);

  await joinConvergentCurvePool(
    poolId,
    trader1,
    balancerVaultContract,
    tokens,
    baseAssetDecimals,
    "1000"
  );

  const numBatches = 100;
  let batchCount = 0;
  while (batchCount < numBatches) {
    try {
      const numSwaps = 1;
      let joinCount = 0;
      const joins = [];
      while (joinCount < numSwaps) {
        joins.push(
          joinConvergentCurvePool(
            poolId,
            trader1,
            balancerVaultContract,
            tokens,
            baseAssetDecimals,
            "11.123"
          )
        );

        joins.push(
          exitConvergentCurvePool(
            poolId,
            trader1,
            balancerVaultContract,
            tokens,
            baseAssetDecimals,
            "10.02"
          )
        );

        joinCount += 1;
        await Promise.all(joins);
      }
    } catch (error) {
      console.log("error", error);
    }
    batchCount += 1;
  }
}

simpleJoins()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
