import { TokenList } from "@uniswap/token-lists";
import fs from "fs";
import hre from "hardhat";

import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import { getAssetProxies } from "src/tokenlist/getAssetProxies";
import { getBaseAssets } from "src/tokenlist/getBaseAssets";
import { getCCPools } from "src/tokenlist/getCCPools";
import { getVaults } from "src/tokenlist/getVaults";
import { getWeightedPools } from "src/tokenlist/getWeightedPools";

import { getPrincipalTokens } from "./getPrincipalTokens";
import { getYieldTokensFromTranches } from "./getYieldTokens";
import { tags } from "./tags";

export async function getTokenList(
  addressesJson: AddressesJsonFile,
  name: string,
  outputPath: string
) {
  const {
    chainId,
    addresses: {
      balancerVaultAddress,
      trancheFactoryAddress,
      wethAddress,
      usdcAddress,
      convergentPoolFactoryAddress,
      weightedPoolFactoryAddress,
    },
    safelist,
  } = addressesJson;

  const baseAssetsList = await getBaseAssets(wethAddress, usdcAddress, chainId);
  const { tranches, principalTokensList } = await getPrincipalTokens(
    trancheFactoryAddress,
    chainId,
    safelist
  );
  const assetProxiesList = await getAssetProxies(tranches, chainId);
  const vaultsList = await getVaults(
    assetProxiesList.map(({ extensions: { vault } }) => vault),
    chainId
  );
  const yieldTokensList = await getYieldTokensFromTranches(tranches, chainId);
  const ccPoolsList = await getCCPools(
    convergentPoolFactoryAddress,
    chainId,
    safelist
  );
  const weightedPoolsList = await getWeightedPools(
    wethAddress,
    usdcAddress,
    balancerVaultAddress,
    weightedPoolFactoryAddress,
    chainId,
    safelist
  );

  const tokens = [
    ...baseAssetsList,
    ...assetProxiesList,
    ...vaultsList,
    ...principalTokensList,
    ...yieldTokensList,
    ...ccPoolsList,
    ...weightedPoolsList,
  ];
  const tokenList: TokenList = {
    name,
    logoURI: "https://element.fi/logo.svg",
    tags,
    timestamp: new Date().toISOString(),
    version: {
      // TODO: implement this
      major: 0,
      minor: 0,
      patch: 0,
    },
    tokens,
  };
  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // shared safely.  For now, just look at this file in vscode and make sure
  // there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString);
}
