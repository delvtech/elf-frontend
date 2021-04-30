import { Tags, TokenList } from "@uniswap/token-lists";
import fs from "fs";
import hre from "hardhat";

import { AddressesJsonFile } from "../../../addresses/AddressesJsonFile";

import { getYieldTokens } from "./getYieldTokens";
import { getPrincipalTokens } from "./getPrincipalTokens";


const tags: Tags = {
  eP: {
    name: "Principal token",
    description: "Token that represents a deposit of principal into a yield position",
  },
  eY: {
    name: "Yield token",
    description: "Token that represents the yield on a deposit into a yield position"
  }
};

export async function getTokenList(addressesJson: AddressesJsonFile, name: string, outputPath: string) {
  const {chainId, addresses: {trancheFactoryAddress, interestTokenFactoryAddress} } = addressesJson;

  const principalTokensList =  await getPrincipalTokens(trancheFactoryAddress, chainId);
  const yieldTokensList =  await getYieldTokens(interestTokenFactoryAddress, chainId);

  const tokens = [...principalTokensList, ...yieldTokensList];
  const tokenList: TokenList = {
    name,
    logoURI: "https://element.fi/logo.svg",
    tags,
    timestamp: new Date().toISOString(),
    version: {
        // TODO: implement this
        major: 0,
        minor: 0,
        patch: 0
    },
    tokens,
  };
  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // shared safely.  For now, just look at this file in vscode and make sure
  // there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString );
}
