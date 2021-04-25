import hre from "hardhat";
import fs from "fs";
import zip from "lodash.zip";

import testnetAddresses from "src/testnet.addresses.json";
import { Token } from "src/TokenList";
import { InterestTokenFactory__factory } from "src/types/factories/InterestTokenFactory__factory";
import { InterestToken__factory } from "src/types/factories/InterestToken__factory";
import { TrancheFactory__factory } from "src/types/factories/TrancheFactory__factory";
import { Tranche__factory } from "src/types/factories/Tranche__factory";

const provider = hre.ethers.provider;

export async function getTokenList() {
  const principalTokensList =  await getPrincipalTokens();
  const interestTokensList =  await getInterestTokens();

  const tokenList = {
    name: "Testnet token list",
    logoURI: "https://element.fi/logo.svg",
    tags: {
        ptToken: {
            name: "Principal token",
            description: "Token that represents a deposit of principal into a yield position"
        },
        ytToken: {
            name: "Yield token",
            description: "Token that represents the yield on a deposit into a yield position"
        }
    },
    timestamp: new Date().toISOString(),
    version: {
        // TODO: implement this
        major: 0,
        minor: 0,
        patch: 0
    },
    tokens: [...principalTokensList, ...interestTokensList],
  };
  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);
  fs.writeFileSync("./testnet.tokenlist.json",tokenListString );
}
export async function getPrincipalTokens() {
    const trancheFactory = TrancheFactory__factory.connect(testnetAddresses.trancheFactoryAddress,provider);
    const filter = trancheFactory.filters.TrancheCreated(null,null,null);
    const events = await trancheFactory.queryFilter(filter);
    const trancheAddresses =
    (events.map(
      (event) =>
        // The first arg is the trancheAddress
        event.args?.[0]
    ) as string[]);

    const chainId = hre.ethers.provider.network.chainId;

    const tranches = trancheAddresses.map((address) => Tranche__factory.connect(address, provider));
    const symbols = await Promise.all(tranches.map(tranche => tranche.symbol()));
    const names = await Promise.all(tranches.map(tranche => tranche.name()));
    const decimals = await Promise.all(tranches.map(tranche => tranche.decimals()));

    const principalTokensList: Token[] = zip(trancheAddresses,symbols, names, decimals,)
      .map(([address, symbol, name, decimal] ) =>{
        return {
            chainId,
            address: address as string,
            symbol: symbol as string,
            decimals: decimal as number,
            name: name as string,
            tags: ["ptToken"],
            // TODO: What logo do we want to show for interest tokens?
            // logoURI: ""
        };
    });

    return principalTokensList;

}
export async function getInterestTokens() {
    const interestTokenFactory = InterestTokenFactory__factory.connect(testnetAddresses.interestTokenFactoryAddress,provider);
    const filter = interestTokenFactory.filters.InterestTokenCreated(null,null);
    const events = await interestTokenFactory.queryFilter(filter);
    const interestTokenAddresses =
    (events.map(
      (event) =>
        // The first arg is the interestToken
        event.args?.[0]
    ) as string[]);

    const chainId = hre.ethers.provider.network.chainId;

    const interestTokens = interestTokenAddresses.map((address) => InterestToken__factory.connect(address, provider));
    const symbols = await Promise.all(interestTokens.map(tranche => tranche.symbol()));
    const names = await Promise.all(interestTokens.map(tranche => tranche.name()));
    const decimals = await Promise.all(interestTokens.map(tranche => tranche.decimals()));

    const interestTokensList: Token[] = zip(interestTokenAddresses,symbols, names, decimals,)
      .map(([address, symbol, name, decimal] ) =>{
        return {
            chainId,
            address: address as string,
            symbol: symbol as string,
            decimals: decimal as number,
            name: name as string,
            tags: ["ytToken"],
            // TODO: What logo do we want to show for interest tokens?
            // logoURI: ""
        };
    });

    return interestTokensList;

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getTokenList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
