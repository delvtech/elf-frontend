import "module-alias/register";

import fs from "fs";
import hre from "hardhat";

import { deployConvergentPoolFactory } from "src/scripts/deployConvergentPoolFactory";
import { deployInterestTokenFactory } from "src/scripts/deployInterestTokenFactory";
import { deployTrancheFactory } from "src/scripts/deployTrancheFactory";
import { THIRTY_DAYS_IN_SECONDS } from "src/time";

import { deployBalancerVault } from "./balancerV2Vault";
import { deployBaseAssets } from "./baseAssets";
import { deployTrancheAndMarket } from "./deployTrancheAndMarket";
import { deployVaultsAndProxys } from "./deployVaultsAndProxys";
import { deployWeightedPoolFactory } from "./deployWeightedPoolFactory";
import { getSigner, SIGNER } from "./getSigner";
import { mintTokensForAddress } from "./mintTokensForAddress";
import { deployUserProxy } from "./userProxy";
import { AddressesJsonFile } from "../addresses/AddressesJsonFile";

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
  await balancerVaultContract.setRelayerApproval(
    elementAddress,
    elementAddress,
    true
  );

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

  console.log("deploy first WETH tranche");
  const {
    trancheContract: firstWethTrancheContract,
    fytPoolContract: firstWethFytPoolContract,
    ycPoolContract: firstWethYcPoolContract,
    fytPoolId: wethFytPoolId,
    ycPoolId: wethYcPoolId,

  } = await deployTrancheAndMarket(
    elementSigner,
    trancheFactory,
    wethYearnVaultAssetProxy,
    wethContract,
    balancerVaultContract,
    convergentPoolFactory,
    weightedPoolFactory,
    {
      mintAmount: "20000",
      baseAssetIn: "20000",
      yieldAssetIn: "10000",
      ytBaseAssetIn: "1000",
      ytYieldAssetIn: "20000",
    }
  );

  console.log("deploy second WETH tranche");
  // second WETH tranche
  const {
    trancheContract: secondWethTrancheContract,
    fytPoolContract: secondWethFytPoolContract,
    ycPoolContract: secondWethYcPoolContract,
  } = await deployTrancheAndMarket(
    elementSigner,
    trancheFactory,
    wethYearnVaultAssetProxy,
    wethContract,
    balancerVaultContract,
    convergentPoolFactory,
    weightedPoolFactory,
    {
      mintAmount: "20000",
      baseAssetIn: "20000",
      yieldAssetIn: "10000",
      ytBaseAssetIn: "1000",
      ytYieldAssetIn: "20000",
      // ~ 3 months
      durationInSeconds: THIRTY_DAYS_IN_SECONDS * 3,
    }
  );

  console.log("deploy expired WETH tranche");
  // expired WETH tranche
  const {
    trancheContract: expiredWethTrancheContract,
    fytPoolContract: expiredWethFytPoolContract,
    ycPoolContract:  expiredWethYcPoolContract,
  } = await deployTrancheAndMarket(
    elementSigner,
    trancheFactory,
    wethYearnVaultAssetProxy,
    wethContract,
    balancerVaultContract,
    convergentPoolFactory,
    weightedPoolFactory,
    {
      mintAmount: "2000",
      baseAssetIn: "20",
      yieldAssetIn: "13",
      ytBaseAssetIn: "100", // ratio must be 1:20
      ytYieldAssetIn: "2000",
      durationInSeconds: 120,
    }
  );
  await yWeth.updateShares();

  console.log("deploy USDC tranche");
  // usdc tranche
  const {
    trancheContract: usdcTrancheContract,
    fytPoolContract: usdcFytPoolContract,
    ycPoolContract: usdcYcPoolContract,
    fytPoolId: usdcFytPoolId,
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
      ytBaseAssetIn: "100000",
      ytYieldAssetIn: "2000000",
    }
  );
  // add some interest to yUsdc
  await yUsdc.updateShares();

  // deploy user proxy
  const userProxyContract = await deployUserProxy(
    elementSigner,
    wethContract,
    trancheFactory
  );

  console.log("Disabling automine");
  await hre.ethers.provider.send("evm_setAutomine", [false]);
  console.log("Setting mining interval to 10s");
  await hre.ethers.provider.send("evm_setIntervalMining", [10_000]);

  // Produce a full list of all addresses deployed in the mian.ts script.
  const allAddresses = JSON.stringify(
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
      wethTrancheAddress: firstWethTrancheContract.address,
      usdcTrancheAddress: usdcTrancheContract.address,

      // market addresses and ids
      weightedPoolFactoryAddress: weightedPoolFactory.address,
      convergentPoolFactoryAddress: convergentPoolFactory.address,
      marketFyWethAddress: firstWethFytPoolContract.address,
      marketFyWethId: wethFytPoolId,
      marketYcWethAddress: firstWethYcPoolContract.address,
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

  console.log("all-addresses.json", allAddresses);
  fs.writeFileSync("./src/all-addresses.json", allAddresses);

  // Produce a schema-compliant testnet.addresses.json file
  const addressesJson:AddressesJsonFile  = {
    chainId: 31337,
    addresses: {
      balancerVaultAddress: balancerVaultContract.address,
      trancheFactoryAddress: trancheFactory.address,
      interestTokenFactoryAddress: interestTokenFactory.address,
      weightedPoolFactoryAddress: weightedPoolFactory.address,
      convergentPoolFactoryAddress: convergentPoolFactory.address,
      userProxyContractAddress: userProxyContract.address,
      wethAddress: wethContract.address,
      usdcAddress: usdcContract.address,
    },
    safelist: [
      firstWethTrancheContract.address,
      firstWethFytPoolContract.address,
      firstWethYcPoolContract.address,
      secondWethTrancheContract.address,
      secondWethFytPoolContract.address,
      secondWethYcPoolContract.address,
      expiredWethTrancheContract.address,
      expiredWethFytPoolContract.address,
      expiredWethYcPoolContract.address,
      usdcTrancheContract.address,
      usdcFytPoolContract.address,
      usdcYcPoolContract.address,
    ],
  };
  const schemaAddresses = JSON.stringify(
     addressesJson,
    null,
    2
  );

  console.log("testnet.addresses.json", schemaAddresses);
  fs.writeFileSync("./src/addresses/testnet.addresses.json", schemaAddresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
