import "module-alias/register";

import { formatEther, formatUnits } from "ethers/lib/utils";
import fs from "fs";
import hre, { ethers } from "hardhat";

import {
  ConvergentPoolFactory__factory,
  ERC20__factory,
  InterestTokenFactory__factory,
  TrancheFactory__factory,
  USDC,
  USDC__factory,
  UserProxy__factory,
  WeightedPoolFactory__factory,
  WETH,
  WETH__factory,
} from "src/types";

import { getSigner, SIGNER } from "src/scripts/getSigner";

import { deployBalancerVault } from "./balancerV2Vault";

const json = {
  chainId: 1,
  addresses: {
    balancerVaultAddress: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    convergentPoolFactoryAddress: "0xb7561f547F3207eDb42A6AfA42170Cd47ADD17BD",
    daiAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    interestTokenFactoryAddress: "0x17cb1f74119DFE718f786A05bEa7D71bF438678c",
    trancheFactoryAddress: "0x62F161BF3692E4015BefB05A03a94A40f520d1c0",
    usdcAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    userProxyContractAddress: "0xEe4e158c03A10CBc8242350d74510779A364581C",
    weightedPoolFactoryAddress: "0x8E9aa87E45e92bad84D5F8DD1bff34Fb92637dE9",
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    lusdAddress: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
  },
  safelist: [
    "0x94BE72dc46fe8f7e9f40FBD2c31826f472F4036E",
    "0x0a9E96988E21c9A03B8DC011826A00259e02C46e",
    "0x6De69beB66317557E65168BD7D3fff22a89dBb11",
  ],
};
async function main() {
  const elementSigner = await getSigner(SIGNER.ELEMENT, hre);
  const balancerSigner = await getSigner(SIGNER.ELEMENT, hre);
  const userSigner = await getSigner(SIGNER.USER, hre);
  const wethSigner = await getSigner(SIGNER.WETH, hre);
  const usdcSigner = await getSigner(SIGNER.USDC, hre);
  const elementAddress = await elementSigner.getAddress();
  const balancerAddress = await balancerSigner.getAddress();
  const userAddress = await userSigner.getAddress();

  const wethContract = WETH__factory.connect(
    json.addresses.wethAddress,
    elementSigner
  );

  const usdcContract = USDC__factory.connect(
    json.addresses.usdcAddress,
    elementSigner
  );

  const daiContract = ERC20__factory.connect(
    json.addresses.daiAddress,
    elementSigner
  );

  // get some whale accounts
  const WETH_WHALE_ADDRESS = "0x0f4ee9631f4be0a63756515141281a3e2b293bbe";
  const USDC_WHALE_ADDRESS = "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503";
  const DAI_WHALE_ADDRESS = "0x4f868c1aa37fcf307ab38d215382e88fca6275e2";

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [WETH_WHALE_ADDRESS],
  });
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [USDC_WHALE_ADDRESS],
  });
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [DAI_WHALE_ADDRESS],
  });

  const wethWhaleSigner = await ethers.provider.getSigner(WETH_WHALE_ADDRESS);
  const usdcWhaleSigner = await ethers.provider.getSigner(USDC_WHALE_ADDRESS);
  const daiWhaleSigner = await ethers.provider.getSigner(DAI_WHALE_ADDRESS);

  const wethWhaleBalance = await wethContract.balanceOf(WETH_WHALE_ADDRESS);
  const usdcWhaleBalance = await usdcContract.balanceOf(USDC_WHALE_ADDRESS);
  const daiWhaleBalance = await daiContract.balanceOf(DAI_WHALE_ADDRESS);
  console.log("wethWhaleBalance", formatEther(wethWhaleBalance));
  console.log("usdcWhaleBalance", formatUnits(usdcWhaleBalance, 6));
  console.log("daiWhaleBalance", formatEther(daiWhaleBalance));

  // // supply element with WETH and USDC
  // await mintTokensForAddress(elementAddress, {
  //   tokens: [wethContract, usdcContract],
  //   amounts: "100000000000",
  // });

  // // supply user with WETH and USDC
  // await mintTokensForAddress(userAddress, {
  //   tokens: [wethContract, usdcContract],
  //   amounts: "100000000000",
  // });

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

  // get factories
  const weightedPoolFactory = WeightedPoolFactory__factory.connect(
    json.addresses.weightedPoolFactoryAddress,
    elementSigner
  );
  const convergentPoolFactory = ConvergentPoolFactory__factory.connect(
    json.addresses.convergentPoolFactoryAddress,
    elementSigner
  );
  const interestTokenFactory = InterestTokenFactory__factory.connect(
    json.addresses.interestTokenFactoryAddress,
    elementSigner
  );

  const trancheFactory = TrancheFactory__factory.connect(
    json.addresses.trancheFactoryAddress,
    elementSigner
  );

  // get user proxy
  const userProxyContract = UserProxy__factory.connect(
    json.addresses.userProxyContractAddress,
    elementSigner
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
