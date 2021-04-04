import { parseEther } from "ethers/lib/utils";
import hre from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// import hre from "hardhat";
import { ERC20 } from "src/types/ERC20";

import { MAX_ALLOWANCE } from "src/maxAllowance";
import { batchSwapIn } from "src/scripts/batchSwapIn";
import { getContracts } from "src/scripts/getContracts";
import { getSigner, SIGNER } from "src/scripts/getSigner";

async function simpleSwaps() {
  const {
    balancerVaultContract,
    wethContract,
    wethTrancheContract,
    marketFyWethContract,
  } = getContracts(hre);

  // do some trades
  const trader1 = await getSigner(SIGNER.TRADER1, hre);
  const trader1Address = await trader1.getAddress();
  const bVaultTrader1 = balancerVaultContract.connect(trader1);

  const wethTrader1 = wethContract.connect(trader1);
  const wethTrancheTrader1 = wethTrancheContract.connect(trader1);
  await wethTrader1.approve(balancerVaultContract.address, MAX_ALLOWANCE);
  await wethTrancheTrader1.approve(
    balancerVaultContract.address,
    MAX_ALLOWANCE
  );

  await wethTrader1.mint(trader1Address, parseEther("10000"));
  const wethFytPoolId = await marketFyWethContract.connect(trader1).getPoolId();

  const numSwaps = 4;
  let count = 0;
  while (count < numSwaps) {
    console.log("swap ", count);
    await batchSwapIn(
      wethTrader1,
      (wethTrancheTrader1 as unknown) as ERC20,
      wethFytPoolId,
      trader1Address,
      bVaultTrader1,
      "100"
    );

    count += 1;
  }
  console.log("count", count);
}

simpleSwaps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
