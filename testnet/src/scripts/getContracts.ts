import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ConvergentCurvePool__factory } from "src/types/factories/ConvergentCurvePool__factory";
import { ConvergentPoolFactory__factory } from "src/types/factories/ConvergentPoolFactory__factory";
import { Tranche__factory } from "src/types/factories/Tranche__factory";
import { USDC__factory } from "src/types/factories/USDC__factory";
import { Vault__factory } from "src/types/factories/Vault__factory";
import { WeightedPoolFactory__factory } from "src/types/factories/WeightedPoolFactory__factory";
import { WETH__factory } from "src/types/factories/WETH__factory";

import addresses from "src/addresses.json";

export function getContracts(hre: HardhatRuntimeEnvironment) {
  const {
    balancerVaultAddress,
    wethAddress,
    usdcAddress,
    convergentPoolFactoryAddress,
    weightedPoolFactoryAddress,
    wethTrancheAddress,
    marketFyWethAddress,
  } = addresses;
  const provider = hre.ethers.provider;
  const balancerVaultContract = Vault__factory.connect(
    balancerVaultAddress,
    provider
  );
  const wethContract = WETH__factory.connect(wethAddress, provider);
  const usdcContract = USDC__factory.connect(usdcAddress, provider);

  const convergentPoolFactory = ConvergentPoolFactory__factory.connect(
    convergentPoolFactoryAddress,
    provider
  );
  const weightedPoolFactory = WeightedPoolFactory__factory.connect(
    weightedPoolFactoryAddress,
    provider
  );

  const wethTrancheContract = Tranche__factory.connect(
    wethTrancheAddress,
    provider
  );

  const marketFyWethContract = ConvergentCurvePool__factory.connect(
    marketFyWethAddress,
    provider
  );

  return {
    balancerVaultContract,
    wethContract,
    usdcContract,
    convergentPoolFactory,
    weightedPoolFactory,
    wethTrancheContract,
    marketFyWethContract,
  };
}
