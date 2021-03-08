import { Signer } from "ethers";
import { USDC } from "types/USDC";
import { WETH } from "types/WETH";
import { YVaultAssetProxy } from "types/YVaultAssetProxy";

import { deployYearnVault } from "./deployYVault";
import { deployYearnVaultAssetProxy } from "./deployYVaultAssetProxy";

export async function deployVaultsAndProxys(
  signer: Signer,
  wethContract: WETH,
  usdcContract: USDC
) {
  // deploy stubbed yearn vault
  const yWeth = await deployYearnVault(
    signer,
    wethContract.address,
    "WETH Yearn Vault",
    "yWETH"
  );

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
