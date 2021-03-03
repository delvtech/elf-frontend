import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BFactory, ElfFactory, ERC20, USDC, WETH } from "types";

import { MAX_ALLOWANCE } from "../maxAllowance";
import { YC__factory } from "../types/factories/YC__factory";
import { deployBalancerPool } from "./balancerPool";
import { deployElf } from "./elf";
import { setupBalancerPool } from "./setupBalancerPool";
import { deployTranche } from "./tranche";

// TODO: add options for the tranche and balancer pools
// TODO: add options to initialize market with YCs
export async function setupElfTrancheAndMarkets(
  elfFactoryContract: ElfFactory,
  baseAssetContract: WETH | USDC,
  elementSigner: Signer,
  bFactoryContract: BFactory,
  elementAddress: string,
  elfName: string,
  elfSymbol: string
) {
  const elfContract = await deployElf(
    elfName,
    elfSymbol,
    elfFactoryContract,
    baseAssetContract,
    elementSigner
  );
  const trancheContract = await deployTranche(
    elfContract,
    "SIX_MONTHS",
    elementSigner
  );

  const marketFYTContract = await deployBalancerPool(
    bFactoryContract,
    elementSigner
  );

  // allow elf contract to take user's base asset tokens
  await baseAssetContract.approve(elfContract.address, MAX_ALLOWANCE);
  const baseAssetDecimals = await baseAssetContract.decimals();

  // deposit base asset into elf
  await elfContract.deposit(
    elementAddress,
    parseUnits("10000", baseAssetDecimals)
  );

  // allow tranche contract to take user's elf tokens
  await elfContract.approve(trancheContract.address, MAX_ALLOWANCE);

  // deposit elf into tranche contract
  await trancheContract.deposit(
    parseUnits("10000", baseAssetDecimals),
    elementAddress
  );

  /********************************************** */
  /* Get some FYTs to seed the balancer pool with */
  /********************************************** */
  // allow balancer pool to take user's fyt and base tokens
  await baseAssetContract.approve(marketFYTContract.address, MAX_ALLOWANCE);
  await trancheContract.approve(marketFYTContract.address, MAX_ALLOWANCE);

  // Seed the pool with inital liquidity
  await setupBalancerPool(
    marketFYTContract,
    (baseAssetContract as unknown) as ERC20,
    trancheContract,

    {
      // seed with more FYTs so they are worth less than the base asset, ie:
      // being sold at a discount
      yieldAssetBalance: "10000",
      baseAssetBalance: "9500",
    }
  );

  // check spot price
  const spotPriceFYT = await marketFYTContract.getSpotPrice(
    baseAssetContract.address,
    trancheContract.address // if i want one of these tokens
  );
  console.log("spotPrice FYT", formatUnits(spotPriceFYT));

  await marketFYTContract.finalize();

  const marketYCContract = await deployBalancerPool(
    bFactoryContract,
    elementSigner
  );
  /********************************************** */
  /********************************************** */
  /* Get some YCs to seed the balancer pool with */
  /********************************************** */
  // allow balancer pool to take user's yc and base tokens
  await baseAssetContract.approve(marketYCContract.address, MAX_ALLOWANCE);
  const ycAddress = await trancheContract.yc();
  const ycContract = YC__factory.connect(ycAddress, elementSigner);
  await ycContract.approve(marketYCContract.address, MAX_ALLOWANCE);

  // Seed the pool with inital liquidity
  await setupBalancerPool(
    marketYCContract,
    (baseAssetContract as unknown) as ERC20,
    ycContract,
    {
      // seed with 10x more YCs so the price reflects a reasonable yield
      baseAssetBalance: "1000",
      yieldAssetBalance: "10000",
    }
  );

  // check spot price
  const spotPriceYC = await marketYCContract.getSpotPrice(
    baseAssetContract.address,
    ycContract.address
  );
  console.log("spotPrice YC", formatUnits(spotPriceYC));

  await marketYCContract.finalize();
  /********************************************** */
  return {
    elfContract,
    trancheContract,
    marketFYTContract,
    marketYCContract,
  };
}
