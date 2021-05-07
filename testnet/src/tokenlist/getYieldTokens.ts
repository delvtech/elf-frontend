import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";
import { TokenListTag } from "src/tokenlist/tags";
import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { InterestTokenFactory__factory } from "src/types/factories/InterestTokenFactory__factory";
import { InterestToken__factory } from "src/types/factories/InterestToken__factory";
import { Tranche__factory } from "src/types/factories/Tranche__factory";
import { WrappedPosition__factory } from "src/types/factories/WrappedPosition__factory";
import { InterestToken } from "src/types/InterestToken";
import { Tranche } from "src/types/Tranche";

export const provider = hre.ethers.provider;

export async function getYieldTokensFromFactory(interestTokenFactoryAddress: string, chainId: number, safelist: string[]) {
  const interestTokenFactory = InterestTokenFactory__factory.connect(interestTokenFactoryAddress, provider);
  const filter = interestTokenFactory.filters.InterestTokenCreated(null, null);
  const events = await interestTokenFactory.queryFilter(filter);
  const allInterestTokenAddresses = (events.map(
    (event) =>
      // The first arg is the interestToken
      event.args?.[0]
  ) as string[]);
  const safeInterestTokenAddresses = allInterestTokenAddresses.filter(address => safelist.includes(address));


  const interestTokens = safeInterestTokenAddresses.map((address) => InterestToken__factory.connect(address, provider));
  const trancheAddresses = await Promise.all(interestTokens.map(interestToken => interestToken.tranche()));
  const tranches = trancheAddresses.map((address) => Tranche__factory.connect(address, provider));
  const underlyingAddresses = await Promise.all(tranches.map(tranche => tranche.underlying()));
  const underlyingSymbols = await getUnderlyingSymbols(interestTokens);
  const yieldTokenNames = formatYieldTokenNames(underlyingSymbols);
  const yieldTokenSymbols = formatYieldTokenSymbols(underlyingSymbols);

  const decimals = await Promise.all(interestTokens.map(interestToken => interestToken.decimals()));

  const yieldTokensList: TokenInfo[] = zip(safeInterestTokenAddresses, yieldTokenSymbols, yieldTokenNames, decimals, underlyingAddresses)
    .map(([address, symbol, name, decimal, underlying]): TokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        extensions: {underlying: underlying as string},
        name: name as string,
        tags: [TokenListTag.YIELD],
        // TODO: What logo do we want to show for interest tokens?
        // logoURI: ""
      };
    });

  return yieldTokensList;
}

export async function getYieldTokensFromTranches(tranches: Tranche[], chainId: number) {
  const interestTokenAddresses = await Promise.all(tranches.map(tranche => tranche.interestToken()));
  const interestTokens = interestTokenAddresses.map(address => InterestToken__factory.connect(address, provider));
  const underlyingAddresses = await Promise.all(tranches.map(tranche => tranche.underlying()));
  const underlyingSymbols = await getUnderlyingSymbols(interestTokens);
  const yieldTokenNames = formatYieldTokenNames(underlyingSymbols);
  const yieldTokenSymbols = formatYieldTokenSymbols(underlyingSymbols);

  const decimals = await Promise.all(interestTokens.map(interestToken => interestToken.decimals()));

  const yieldTokensList: TokenInfo[] = zip(interestTokenAddresses, yieldTokenSymbols, yieldTokenNames, decimals, underlyingAddresses)
    .map(([address, symbol, name, decimal, underlying]) => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        extensions: {underlying: underlying as string},
        tags: [TokenListTag.YIELD],
        // TODO: What logo do we want to show for interest tokens?
        // logoURI: ""
      };
    });

  return yieldTokensList;
}

function formatYieldTokenSymbols(underlyingSymbols: string[]) {
    const yieldTokenSymbols= underlyingSymbols.map(symbol => {
        const name = symbol === 'WETH' ? 'eY-ETH' : `eY-${symbol}`;
        return name;
    });
    return yieldTokenSymbols;
}


function formatYieldTokenNames(underlyingSymbols: string[]) {
    const yieldTokenNames = underlyingSymbols.map(symbol => {
        const name = symbol === 'WETH' ? 'ETH Yield Token' : `${symbol} Yield Token`;
        return name;
    });
    return yieldTokenNames;
}

async function getUnderlyingSymbols(interestTokens: InterestToken[]) {
  const trancheAddresses = await Promise.all(interestTokens.map(interestToken => interestToken.tranche()));
  const tranches = trancheAddresses.map((address) => Tranche__factory.connect(address, provider));
  const underlyingAddresses = await Promise.all(tranches.map(tranche => tranche.underlying()));
  const underlyingContracts = underlyingAddresses.map(address => ERC20__factory.connect(address, provider));
  const underlyingSymbols = await Promise.all(underlyingContracts.map(underlying => underlying.symbol()));
  return underlyingSymbols;
}