import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";

import { Tranche__factory } from "src/types/factories/Tranche__factory";
import { TrancheFactory__factory } from "src/types/factories/TrancheFactory__factory";

import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { Tranche } from "src/types/Tranche";
import { TokenListTag } from "src/tokenlist/tags";

export const provider = hre.ethers.provider;
export async function getPrincipalTokens(
  trancheFactoryAddress: string,
  chainId: number,
  safelist: string[]
) {
  const trancheFactory = TrancheFactory__factory.connect(
    trancheFactoryAddress,
    provider
  );
  const filter = trancheFactory.filters.TrancheCreated(null, null, null);
  const events = await trancheFactory.queryFilter(filter);
  const trancheAddresses = events.map(
    (event) =>
      // The first arg is the trancheAddress
      event.args?.[0]
  ) as string[];
  const safeTrancheAddresses = trancheAddresses.filter((address) =>
    safelist.includes(address)
  );

  const safeTranches = safeTrancheAddresses.map((address) =>
    Tranche__factory.connect(address, provider)
  );

  // Create the principal token name, eg: "ETH Principal Token"
  const principalTokenNames = await getPrincipalTokenName(safeTranches);
  // Create the principal token symbol, eg: "eP-ELFyWETH"
  const principalTokenSymbols = await getPrincipalTokenSymbols(safeTranches);
  const decimals = await Promise.all(
    safeTranches.map((tranche) => tranche.decimals())
  );
  const underlyingAddresses = await Promise.all(
    safeTranches.map((tranche) => tranche.underlying())
  );
  const unlockTimestamps = await Promise.all(
    safeTranches.map((tranche) => tranche.unlockTimestamp())
  );
  const interestTokens = await Promise.all(
    safeTranches.map((tranche) => tranche.interestToken())
  );
  const positions = await Promise.all(
    safeTranches.map((tranche) => tranche.position())
  );

  const principalTokensList: TokenInfo[] = zip<any>(
    safeTrancheAddresses,
    principalTokenSymbols,
    principalTokenNames,
    decimals,
    underlyingAddresses,
    unlockTimestamps,
    interestTokens,
    positions
  ).map(
    ([
      address,
      symbol,
      name,
      decimal,
      underlying,
      unlockTimestamp,
      interestToken,
      position,
    ]): TokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        extensions: {
          underlying: underlying as string,
          position: position as string,
          interestToken: interestToken as string,
          unlockTimestamp: unlockTimestamp?.toNumber() as number,
        },
        name: name as string,
        tags: [TokenListTag.PRINCIPAL],
        // TODO: What logo do we want to show for interest tokens?
        // logoURI: ""
      };
    }
  );

  return { tranches: safeTranches, principalTokensList };
}
async function getPrincipalTokenSymbols(tranches: Tranche[]) {
  const underlyingAddresses = await Promise.all(
    tranches.map((tranche) => tranche.underlying())
  );
  const underlyingContracts = underlyingAddresses.map((address) =>
    ERC20__factory.connect(address, provider)
  );
  const underlyingSymbols = await Promise.all(
    underlyingContracts.map((underlying) => underlying.symbol())
  );
  const principalTokenSymbols = underlyingSymbols.map((symbol) => {
    const name = symbol === "WETH" ? "eP-ETH" : `eP-${symbol}`;
    return name;
  });
  return principalTokenSymbols;
}

async function getPrincipalTokenName(tranches: Tranche[]) {
  const underlyingAddresses = await Promise.all(
    tranches.map((tranche) => tranche.underlying())
  );
  const underlyingContracts = underlyingAddresses.map((address) =>
    ERC20__factory.connect(address, provider)
  );
  const underlyingSymbols = await Promise.all(
    underlyingContracts.map((underlying) => underlying.symbol())
  );
  const principalTokenNames = underlyingSymbols.map((symbol) => {
    const name =
      symbol === "WETH" ? "ETH Principal Token" : `${symbol} Principal Token`;
    return name;
  });
  return principalTokenNames;
}
