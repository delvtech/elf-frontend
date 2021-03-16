import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { USDC } from "src/types/USDC";
import { WETH } from "src/types/WETH";
import { YVaultAssetProxy } from "src/types/YVaultAssetProxy";

import { MAX_ALLOWANCE } from "src/maxAllowance";

import { deployYearnVault } from "./deployYVault";
import { deployYearnVaultAssetProxy } from "./deployYVaultAssetProxy";

export async function deployVaultsAndProxys(
  signer: Signer,
  wethContract: WETH,
  usdcContract: USDC
) {
  const signerAddress = await signer.getAddress();
  // deploy stubbed yearn vault
  const yWeth = await deployYearnVault(
    signer,
    wethContract.address,
    "WETH Yearn Vault",
    "yWETH"
  );
  // prevents divide by zero error
  await wethContract.approve(yWeth.address, MAX_ALLOWANCE);
  await yWeth.deposit(parseUnits("1000", 6), signerAddress);

  // deploy yearn vault asset proxy
  const wethYearnVaultAssetProxy: YVaultAssetProxy = await deployYearnVaultAssetProxy(
    signer,
    yWeth.address,
    wethContract.address,
    "ELF - WETH Yearn Vault",
    "ELFyWETH"
  );

  // deploy stubbed yearn vault
  const yUsdc = await deployYearnVault(
    signer,
    usdcContract.address,
    "USDC Yearn Vault",
    "yUSDC"
  );
  // prevents divide by zero error
  await usdcContract.approve(yUsdc.address, MAX_ALLOWANCE);
  await yUsdc.deposit(parseUnits("1000", 6), signerAddress);

  // deploy yearn vault asset proxy
  const usdcYearnVaultAssetProxy: YVaultAssetProxy = await deployYearnVaultAssetProxy(
    signer,
    yUsdc.address,
    usdcContract.address,
    "ELF - USDC Yearn Vault",
    "ELFyUSDC"
  );

  return {
    yWeth,
    yUsdc,
    wethYearnVaultAssetProxy,
    usdcYearnVaultAssetProxy,
  };
}
