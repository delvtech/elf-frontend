import { parseEther } from "ethers/lib/utils";
import hre from "hardhat";

import { MAX_ALLOWANCE } from "src/maxAllowance";
import { exitConvergentCurvePool } from "src/scripts/exitConvergentCurvePool";
import { getContracts } from "src/scripts/getContracts";
import { getSigner, SIGNER } from "src/scripts/getSigner";
import { joinConvergentCurvePool } from "src/scripts/joinConvergentCurvePool";
import { printSpotPriceForPool } from "src/scripts/printSpotPriceForPool";
import { printTokenInfoForPool } from "src/scripts/printTokenInfoForPool";

async function simpleJoins() {
  const trader1 = await getSigner(SIGNER.TRADER1, hre);
  const {
    balancerVaultContract,
    wethContract,
    wethTrancheContract,
    marketFyWethContract,
    userProxyContract,
  } = getContracts(hre, trader1);

  const trader1Address = await trader1.getAddress();

  await wethContract.approve(balancerVaultContract.address, MAX_ALLOWANCE);
  await wethTrancheContract.approve(
    balancerVaultContract.address,
    MAX_ALLOWANCE
  );

  await wethContract.mint(trader1Address, parseEther("10000000"));
  const wethDecimals = await wethContract.decimals();
  const wethFytPoolId = await marketFyWethContract.getPoolId();
  const { tokens } = await balancerVaultContract.getPoolTokens(wethFytPoolId);
  await printTokenInfoForPool(balancerVaultContract, wethFytPoolId, trader1);

  await wethContract.approve(userProxyContract.address, MAX_ALLOWANCE);
  const expiration = await wethTrancheContract.unlockTimestamp();
  const position = await wethTrancheContract.position();

  const mintTx = await userProxyContract.mint(
    parseEther("10000"),
    wethContract.address,
    expiration,
    position,
    []
  );
  await mintTx.wait(1);

  await joinConvergentCurvePool(
    wethFytPoolId,
    trader1,
    balancerVaultContract,
    tokens,
    wethDecimals,
    "1000",
    "100"
  );

  const numBatches = 100;
  let batchCount = 0;
  while (batchCount < numBatches) {
    try {
      const numSwaps = 2;
      let joinCount = 0;
      const joins = [];
      while (joinCount < numSwaps) {
        joins.push(
          joinConvergentCurvePool(
            wethFytPoolId,
            trader1,
            balancerVaultContract,
            tokens,
            wethDecimals,
            "100",
            "10"
          )
        );
        joins.push(
          exitConvergentCurvePool(
            wethFytPoolId,
            trader1,
            balancerVaultContract,
            tokens,
            wethDecimals,
            "100",
            "10"
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
