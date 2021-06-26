import { TokenList } from "@uniswap/token-lists";
import fs from "fs";

import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import { getAssetProxies } from "src/tokenlist/getAssetProxies";
import { getUnderlyingTokenInfos } from "src/tokenlist/getUnderlyingTokenInfos";
import { getCCPools } from "src/tokenlist/getCCPools";
import { getVaults } from "src/tokenlist/getVaults";
import { getWeightedPools } from "src/tokenlist/getWeightedPools";

import { getPrincipalTokens } from "./principalTokens";
import { getYieldTokensFromTranches } from "./getYieldTokens";
import { tags } from "./tags";
import { PrincipalTokenInfo } from "src/tokenlist/types";

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
      daiAddress,
      lusdAddress,
      convergentPoolFactoryAddress,
      weightedPoolFactoryAddress,
    },
    safelist,
  } = addressesJson;

  // Skip addresses that are "0x0", which can happen if you know the underlying
  // token isn't available on the given chain.
  const baseAssetAddresses = [
    wethAddress,
    usdcAddress,
    daiAddress,
    lusdAddress,
  ].filter((address) => address !== "0x0");

  const baseAssetsList = await getUnderlyingTokenInfos(
    chainId,
    baseAssetAddresses
  );

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
    daiAddress,
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
