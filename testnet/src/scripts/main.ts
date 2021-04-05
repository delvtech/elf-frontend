import "module-alias/register";

import fs from "fs";
import hre from "hardhat";

import { deployConvergentPoolFactory } from "src/scripts/deployConvergentPoolFactory";
import { deployInterestTokenFactory } from "src/scripts/deployInterestTokenFactory";
import { deployTrancheFactory } from "src/scripts/deployTrancheFactory";

import { deployBalancerVault } from "./balancerV2Vault";
import { deployBaseAssets } from "./baseAssets";
import { deployTrancheAndMarket } from "./deployTrancheAndMarket";
import { deployVaultsAndProxys } from "./deployVaultsAndProxys";
import { deployWeightedPoolFactory } from "./deployWeightedPoolFactory";
import { getSigner, SIGNER } from "./getSigner";
import { mintTokensForAddress } from "./mintTokensForAddress";
import { deployUserProxy } from "./userProxy";

async function main() {
  const elementSigner = await getSigner(SIGNER.ELEMENT, hre);
  const balancerSigner = await getSigner(SIGNER.ELEMENT, hre);
  const userSigner = await getSigner(SIGNER.USER, hre);
  const elementAddress = await elementSigner.getAddress();
  const balancerAddress = await balancerSigner.getAddress();
  const userAddress = await userSigner.getAddress();

  // deploy base assets
  const [wethContract, usdcContract] = await deployBaseAssets(elementSigner);

  // supply element with WETH and USDC
  await mintTokensForAddress(elementAddress, {
    tokens: [wethContract, usdcContract],
    amounts: "100000000000",
  });

  // supply user with WETH and USDC
  await mintTokensForAddress(userAddress, {
    tokens: [wethContract, usdcContract],
    amounts: "100000000000",
  });

  // deploy main balancer vault
  const balancerVaultContract = await deployBalancerVault(
    balancerSigner,
    wethContract
  );
  // register element with balancer so we can deploy pools
  await balancerVaultContract.changeRelayerAllowance(elementAddress, true);

  // deploy factories
  const weightedPoolFactory = await deployWeightedPoolFactory(
    elementSigner,
    balancerVaultContract
  );
  const convergentPoolFactory = await deployConvergentPoolFactory(
    elementSigner,
    balancerVaultContract
  );
  const interestTokenFactory = await deployInterestTokenFactory(elementSigner);
  const trancheFactory = await deployTrancheFactory(
    elementSigner,
    interestTokenFactory
  );

  const {
    yWeth,
    wethYearnVaultAssetProxy,
    yUsdc,
    usdcYearnVaultAssetProxy,
  } = await deployVaultsAndProxys(elementSigner, wethContract, usdcContract);

  const {
    trancheContract: wethTrancheContract,
    fytPoolContract: wethFytPoolContract,
    fytPoolId: wethFytPoolId,
    ycPoolContract: wethYcPoolContract,
    ycPoolId: wethYcPoolId,
  } = await deployTrancheAndMarket(
    elementSigner,
    trancheFactory,
    wethYearnVaultAssetProxy,
    wethContract,
    balancerVaultContract,
    convergentPoolFactory,
    weightedPoolFactory,
    { mintAmount: "20000", baseAssetIn: "20000", yieldAssetIn: "10000" }
  );

  const {
    trancheContract: usdcTrancheContract,
    fytPoolContract: usdcFytPoolContract,
    fytPoolId: usdcFytPoolId,
    ycPoolContract: usdcYcPoolContract,
    ycPoolId: usdcYcPoolId,
  } = await deployTrancheAndMarket(
    elementSigner,
    trancheFactory,
    usdcYearnVaultAssetProxy,
    usdcContract,
    balancerVaultContract,
    convergentPoolFactory,
    weightedPoolFactory,
    {
      mintAmount: "20000000",
      baseAssetIn: "20000000",
      yieldAssetIn: "10000000",
    }
  );

  // deploy user proxy
  const userProxyContract = await deployUserProxy(
    elementSigner,
    wethContract,
    trancheFactory
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

      // yearn vaults
      wethYearnVaultAddress: yWeth.address,
      usdcYearnVaultAddress: yUsdc.address,

      // asset proxys
      wethYearnVaultAssetProxyAddress: wethYearnVaultAssetProxy.address,
      usdcYearnVaultAssetProxyAddress: usdcYearnVaultAssetProxy.address,

      // tranche contracts
      trancheFactoryAddress: trancheFactory.address,
      interestTokenFactoryAddress: interestTokenFactory.address,
      wethTrancheAddress: wethTrancheContract.address,
      usdcTrancheAddress: usdcTrancheContract.address,

      // market addresses and ids
      weightedPoolFactoryAddress: weightedPoolFactory.address,
      convergentPoolFactoryAddress: convergentPoolFactory.address,
      marketFyWethAddress: wethFytPoolContract.address,
      marketFyWethId: wethFytPoolId,
      marketYcWethAddress: wethYcPoolContract.address,
      marketYcWethId: wethYcPoolId,

      marketFyUsdcAddress: usdcFytPoolContract.address,
      marketFyUsdcId: usdcFytPoolId,
      marketYcUsdcAddress: usdcYcPoolContract.address,
      marketYcUsdcId: usdcYcPoolId,

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
  fs.writeFileSync("./src/addresses.json", addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
