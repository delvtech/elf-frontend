import { parseEther, parseUnits } from "ethers/lib/utils";
import fs from "fs";
import { YVaultAssetProxy } from "types/YVaultAssetProxy";

import { SIX_MONTHS_IN_SECONDS } from "../time";
import { deployBalancerVault } from "./balancerV2Vault";
import { deployBaseAssets } from "./baseAssets";
import { deployWeightedPoolFactory } from "./deployWeightedPoolFactory";
import { deployYieldPool } from "./deployYieldPool";
import { deployYearnVault } from "./deployYVault";
import { deployYearnVaultAssetProxy } from "./deployYVaultAssetProxy";
import { getSigner, SIGNER } from "./getSigner";
import { mintTokensForAddress } from "./mintTokensForAddress";
import { setupFYTMarket } from "./setupFYTMarket";
import { setupYCMarket } from "./setupYCMarket";
import { deployTranche } from "./tranche";
import { deployUserProxy } from "./userProxy";

async function main() {
  const elementSigner = await getSigner(SIGNER.ELEMENT);
  const balancerSigner = await getSigner(SIGNER.ELEMENT);
  const userSigner = await getSigner(SIGNER.USER);
  const elementAddress = await elementSigner.getAddress();
  const balancerAddress = await balancerSigner.getAddress();
  const userAddress = await userSigner.getAddress();

  // deploy base assets
  const [wethContract, usdcContract] = await deployBaseAssets(elementSigner);

  // supply element with WETH and USDC
  await mintTokensForAddress(elementAddress, {
    tokens: [wethContract, usdcContract],
  });

  // supply user with WETH and USDC
  await mintTokensForAddress(userAddress, {
    tokens: [wethContract, usdcContract],
  });

  // deploy main balancer vault
  const balancerVaultContract = await deployBalancerVault(balancerSigner);
  // register element with balancer so we can deploy pools
  await balancerVaultContract.changeRelayerAllowance(elementAddress, true);
  // deploy the yc market factory
  const weightedPoolFactory = await deployWeightedPoolFactory(
    elementSigner,
    balancerVaultContract
  );

  // deploy stubbed yearn vault
  const yWeth = await deployYearnVault(elementSigner, wethContract.address);

  // deploy yearn vault asset proxy
  const wethYearnVaultAssetProxy: YVaultAssetProxy = await deployYearnVaultAssetProxy(
    elementSigner,
    yWeth.address,
    wethContract.address,
    "eyWETH",
    "eyWETH"
  );

  // deploy a tranche
  const wethTrancheContract = await deployTranche(
    elementSigner,
    wethYearnVaultAssetProxy,
    SIX_MONTHS_IN_SECONDS
  );

  // deploy an FYT market, seed with base asset
  const { poolId, poolContract } = await deployYieldPool(
    elementSigner,
    balancerVaultContract,
    wethContract,
    wethTrancheContract
  );

  // seed market with initial yield asset
  await setupFYTMarket(
    elementSigner,
    balancerVaultContract,
    poolId,
    wethContract,
    wethTrancheContract
  );

  // now setup a yc market
  const {
    poolId: ycPoolId,
    poolContract: ycPoolContract,
  } = await setupYCMarket(
    elementSigner,
    wethTrancheContract,
    balancerVaultContract,
    wethContract,
    weightedPoolFactory
  );

  // deploy user proxy
  const userProxyContract = await deployUserProxy(
    elementSigner,
    wethContract.address
  );

  const addresses = JSON.stringify(
    {
      // signer addresses
      elementAddress,
      balancerAddress,
      userAddress,

      // balancer
      balancerVaultAddress: balancerVaultContract.address,
      marketYcFactory: weightedPoolFactory.address,

      // asset proxy
      yearnVaultAssetProxyAddress: wethYearnVaultAssetProxy.address,

      // tranche contracts
      wethTrancheAddress: wethTrancheContract.address,

      // market addresses and ids
      marketFyWethAddress: poolContract.address,
      marketFyWethId: poolId,
      marketYcWethAddress: ycPoolContract.address,
      marketYcWethId: ycPoolId,

      // user proxy
      userProxyContractAddress: userProxyContract.address,

      // weth addresses
      wethAddress: wethContract.address,

      //usdc addresses
      usdcAddress: usdcContract.address,
    },
    null,
    2
  );
  console.log("addresses", addresses);
  fs.writeFileSync("./addresses.json", addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
