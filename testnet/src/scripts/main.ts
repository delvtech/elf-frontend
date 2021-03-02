import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers/lib/utils";
import fs from "fs";

import { deployBalancerFactory } from "./balancerFactory";
import { deployBaseAssets } from "./baseAssets";
import { deployElfFactory } from "./elfFactory";
import { getSigner, SIGNER } from "./getSigner";
import { setupElfTrancheAndMarkets } from "./setupElfTrancheAndMarkets";
import { deployUserProxy } from "./userProxy";

async function main() {
  const elementSigner = await getSigner(SIGNER.ELEMENT);
  const elementAddress = await elementSigner.getAddress();
  const userSigner = await getSigner(SIGNER.USER);
  const userAddress = await userSigner.getAddress();

  // deploy base assets, give element address some extra tokens
  const [wethContract, usdcContract] = await deployBaseAssets(elementSigner);
  const e_mintWethTx = await wethContract.mint(
    elementAddress,
    parseEther("1000000")
  );
  await e_mintWethTx.wait(1);
  const e_mintUsdcTx = await usdcContract.mint(
    elementAddress,
    parseUnits("1000000", 6)
  );
  await e_mintUsdcTx.wait(1);

  // deploy elf, tranches and markets
  const elfFactoryContract = await deployElfFactory(elementSigner);
  const bFactoryContract = await deployBalancerFactory(elementSigner);

  const {
    elfContract: elfWethContract,
    trancheContract: trancheWethContract,
    marketFYTContract: marketWethFYTContract,
    marketYCContract: marketWethYCContract,
  } = await setupElfTrancheAndMarkets(
    elfFactoryContract,
    wethContract,
    elementSigner,
    bFactoryContract,
    elementAddress,
    "Elemnent WETH yearn vault",
    "ELF-WETH-YVAULT"
  );

  /**
   * remove these consoles when USDC price verified in frontend
   */
  const wethMarketBalance = await marketWethFYTContract.getBalance(
    wethContract.address
  );
  console.log("wethMarketBalance", formatEther(wethMarketBalance));

  const fyWethMarketBalance = await marketWethFYTContract.getBalance(
    trancheWethContract.address
  );
  console.log("fyWethMarketBalance", formatEther(fyWethMarketBalance));
  /************************************************************** */

  const {
    elfContract: elfUsdcContract,
    trancheContract: trancheUsdcContract,
    marketFYTContract: marketUsdcFYTContract,
    marketYCContract: marketUsdcYCContract,
  } = await setupElfTrancheAndMarkets(
    elfFactoryContract,
    usdcContract,
    elementSigner,
    bFactoryContract,
    elementAddress,
    "Element USDC yearn vault",
    "ELF-USDC-YVAULT"
  );

  /**
   * remove these consoles when USDC price verified in frontend
   */
  const usdcMarketBalance = await marketUsdcFYTContract.getBalance(
    usdcContract.address
  );
  console.log("usdcMarketBalance", formatUnits(usdcMarketBalance, 6));

  const fyUsdcMarketBalance = await marketUsdcFYTContract.getBalance(
    trancheUsdcContract.address
  );
  console.log("fyUsdcMarketBalance", formatUnits(fyUsdcMarketBalance, 6));
  /************************************************************** */

  // deploy user proxy
  const userProxyContract = await deployUserProxy(
    elementSigner,
    wethContract.address
  );

  // supply user with WETH and USDC
  const mintWethTx = await wethContract.mint(
    userAddress,
    parseEther("1000000")
  );
  await mintWethTx.wait(1);
  const mintUsdcTx = await usdcContract.mint(
    userAddress,
    parseUnits("1000000", 6)
  );
  await mintUsdcTx.wait(1);

  const wethBalance = await wethContract.balanceOf(userAddress);
  const usdcBalance = await usdcContract.balanceOf(userAddress);
  console.log("user1 supplied with");
  console.log(formatEther(wethBalance), "WETH");
  console.log(formatUnits(usdcBalance, 6), "USDC");

  const addresses = JSON.stringify(
    {
      // signer addresses
      elementAddress,
      userAddress,

      // user proxy
      userProxyContractAddress: userProxyContract.address,

      // factories
      elfFactoryAddress: elfFactoryContract.address,
      bFactoryAddress: bFactoryContract.address,

      // weth addresses
      wethAddress: wethContract.address,
      elfWethAddress: elfWethContract.address,
      trancheWethAddress: trancheWethContract.address,
      marketWethFYTAddress: marketWethFYTContract.address,
      marketWethYCAddress: marketWethYCContract.address,

      //usdc addresses
      usdcAddress: usdcContract.address,
      elfUsdcAddress: elfUsdcContract.address,
      trancheUsdcAddress: trancheUsdcContract.address,
      bPoolUsdcAddress: marketUsdcFYTContract.address,
      marketUsdcFYTAddress: marketUsdcFYTContract.address,
      marketUsdcYCAddress: marketUsdcYCContract.address,
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
