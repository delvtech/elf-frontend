import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";

import { Tranche__factory } from "src/types/factories/Tranche__factory";
import {
  TrancheFactory__factory,
} from "src/types/factories/TrancheFactory__factory";

import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { WrappedPosition__factory } from "src/types/factories/WrappedPosition__factory";
import { Tranche } from "src/types/Tranche";

export const provider = hre.ethers.provider;
export async function getPrincipalTokens(trancheFactoryAddress: string, chainId: number) {
  const trancheFactory = TrancheFactory__factory.connect(trancheFactoryAddress, provider);
  const filter = trancheFactory.filters.TrancheCreated(null, null, null);
  const events = await trancheFactory.queryFilter(filter);
  const trancheAddresses = (events.map(
    (event) =>
      // The first arg is the trancheAddress
      event.args?.[0]
  ) as string[]);

  const tranches = trancheAddresses.map((address) => Tranche__factory.connect(address, provider));

  // Create the principal token name, eg: "ETH Principal Token"
  const principalTokenNames = await getPrincipalTokenName(tranches);
  // Create the principal token symbol, eg: "eP-ELFyWETH"
  const principalTokenSymbols = await getPrincipalTokenSymbols(tranches);

  const decimals = await Promise.all(tranches.map(tranche => tranche.decimals()));

  const principalTokensList: TokenInfo[] = zip(trancheAddresses, principalTokenSymbols, principalTokenNames, decimals)
    .map(([address, symbol, name, decimal]) => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        tags: ["eP"],
        // TODO: What logo do we want to show for interest tokens?
        // logoURI: ""
      };
    });

  return principalTokensList;

}
async function getPrincipalTokenSymbols(tranches: Tranche[]) {
    const wrappedPositionAddresses = await Promise.all(tranches.map(tranche => tranche.position()));
    const wrappedPositions = wrappedPositionAddresses.map(address => WrappedPosition__factory.connect(address, provider));
    const wrappedPositionSymbols = await Promise.all(wrappedPositions.map(vault => vault.symbol()));
    const principalTokenSymbols = wrappedPositionSymbols.map(symbol => `eP-${symbol}`);
    return principalTokenSymbols;
}

async function getPrincipalTokenName(tranches: Tranche[]) {
    const underlyingAddresses = await Promise.all(tranches.map(tranche => tranche.underlying()));
    const underlyingContracts = underlyingAddresses.map(address => ERC20__factory.connect(address, provider));
    const underlyingSymbols = await Promise.all(underlyingContracts.map(underlying => underlying.symbol()));
    const principalTokenNames = underlyingSymbols.map(symbol => {
        const name = symbol === 'WETH' ? 'ETH Principal Token' : `${symbol} Principal Token`;
        return name;
    });
    return principalTokenNames;
}

