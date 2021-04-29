import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";
import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { InterestTokenFactory__factory } from "src/types/factories/InterestTokenFactory__factory";
import { InterestToken__factory } from "src/types/factories/InterestToken__factory";
import { Tranche__factory } from "src/types/factories/Tranche__factory";
import { WrappedPosition__factory } from "src/types/factories/WrappedPosition__factory";
import { InterestToken } from "src/types/InterestToken";
import { provider } from "./main";

export async function getYieldTokens(interestTokenFactoryAddress: string) {
  const interestTokenFactory = InterestTokenFactory__factory.connect(interestTokenFactoryAddress, provider);
  const filter = interestTokenFactory.filters.InterestTokenCreated(null, null);
  const events = await interestTokenFactory.queryFilter(filter);
  const interestTokenAddresses = (events.map(
    (event) =>
      // The first arg is the interestToken
      event.args?.[0]
  ) as string[]);

  const chainId = hre.ethers.provider.network.chainId;

  const interestTokens = interestTokenAddresses.map((address) => InterestToken__factory.connect(address, provider));
  const yieldTokenNames = await getYieldTokenNames(interestTokens);
  const yieldTokenSymbols = await getYieldTokenSymbols(interestTokens);

  const decimals = await Promise.all(interestTokens.map(interestToken => interestToken.decimals()));

  const yieldTokensList: TokenInfo[] = zip(interestTokenAddresses, yieldTokenSymbols, yieldTokenNames, decimals)
    .map(([address, symbol, name, decimal]) => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        tags: ["eY"],
        // TODO: What logo do we want to show for interest tokens?
        // logoURI: ""
      };
    });

  return yieldTokensList;

}
async function getYieldTokenSymbols(interestTokens: InterestToken[]) {
    const trancheAddresses =  await Promise.all(interestTokens.map(interestToken => interestToken.tranche()));
    const tranches = trancheAddresses.map((address) => Tranche__factory.connect(address, provider));
    const wrappedPositionAddresses = await Promise.all(tranches.map(tranche => tranche.position()));
    const wrappedPositions = wrappedPositionAddresses.map(address => WrappedPosition__factory.connect(address, provider));
    const wrappedPositionSymbols = await Promise.all(wrappedPositions.map(vault => vault.symbol()));
    const principalTokenSymbols = wrappedPositionSymbols.map(symbol => `eY-${symbol}`);
    return principalTokenSymbols;
}

async function getYieldTokenNames(interestTokens: InterestToken[]) {
    const trancheAddresses =  await Promise.all(interestTokens.map(interestToken => interestToken.tranche()));
    const tranches = trancheAddresses.map((address) => Tranche__factory.connect(address, provider));
    const underlyingAddresses = await Promise.all(tranches.map(tranche => tranche.underlying()));
    const underlyingContracts = underlyingAddresses.map(address => ERC20__factory.connect(address, provider));
    const underlyingSymbols = await Promise.all(underlyingContracts.map(underlying => underlying.symbol()));
    const yieldTokenNames = underlyingSymbols.map(symbol => {
        const name = symbol === 'WETH' ? 'ETH Yield Token' : `${symbol} Yield Token`;
        return name;
    });
    return yieldTokenNames;
}

