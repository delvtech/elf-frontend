import { Event } from "@ethersproject/contracts";
import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";

import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { Tranche__factory } from "src/types/factories/Tranche__factory";
import { TrancheFactory__factory } from "src/types/factories/TrancheFactory__factory";
import { Tranche } from "src/types/Tranche";
import hardhatSymbolOverrides from "src/addresses/testnet.symbolOverrides.json";

import { PrincipalTokenInfo, TokenListTag } from "src/tokenlist/types";
import { getTokenSymbolMulti } from "src/tokenlist/erc20";

const GOERLI_CHAIN_ID = 5;
const HARDHAT_CHAIN_ID = 31337;
const symbolOverrides: Record<number, Record<string, string>> = {
  [GOERLI_CHAIN_ID]: {
    // these contracts have v1 vault symbols, but we want the v2 vaults on testnet
    "0x44eecA004b2612d131EDA7dA2b9d986E7fED562e": "ePyvCurve-stETH",
    "0x89d66Ad25F3A723D606B78170366d8da9870A879": "ePyvCurve-stETH",
    "0x80272c960b862B4d6542CDB7338Ad1f727E0D18d": "ePyvUSDC",
    "0x8Bd721BB84a30c0078aF4a5a732c7169C5BE6eDB": "ePyvUSDC",
    "0x7D64aD2b83a62C0d02514a43E5B4582C671E5F72": "ePyvUSDC",
  },
  [HARDHAT_CHAIN_ID]: hardhatSymbolOverrides,
};
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
  const trancheCreatedEvents = await trancheFactory.queryFilter(filter);
  const trancheAddresses = trancheCreatedEvents.map(
    (event) =>
      // The first arg is the trancheAddress
      event.args?.[0]
  ) as string[];
  const safeTrancheAddresses = trancheAddresses.filter((address) =>
    safelist.includes(address)
  );
  const createdAtTimestamps = await getTrancheCreatedEvents(
    trancheCreatedEvents,
    safeTrancheAddresses
  );

  const safeTranches = safeTrancheAddresses.map((address) =>
    Tranche__factory.connect(address, provider)
  );

  const principalTokenNames = await getPrincipalTokenName(safeTranches);
  const principalTokenSymbols = await getPrincipalTokenSymbols(
    chainId,
    safeTranches
  );

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
    positions,
    createdAtTimestamps
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
      createdAtTimestamp,
    ]): PrincipalTokenInfo => {
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
          createdAtTimestamp: createdAtTimestamp as number,
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

async function getPrincipalTokenSymbols(chainId: number, tranches: Tranche[]) {
  const trancheAddresses = tranches.map((tranche) => tranche.address);
  const trancheSymbols = await getTokenSymbolMulti(tranches);
  const overrides = symbolOverrides[chainId] || {};
  const symbols = zip(trancheAddresses, trancheSymbols).map((zipped) => {
    const [address, symbol] = zipped as [string, string];
    if (overrides[address]) {
      return overrides[address];
    }
    return symbol;
  });
  return symbols;
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

async function getTrancheCreatedEvents(
  trancheCreatedEvents: Event[],
  trancheAddresses: string[]
) {
  // The events that the given tranches were created in
  const filteredTranches = trancheCreatedEvents.filter((event) =>
    trancheAddresses.includes(event.args?.[0])
  );

  // the blocks the tranches were created in
  const blocks = await Promise.all(
    filteredTranches.map((event) => {
      const blockNumber = event.blockNumber;
      return provider.getBlock(blockNumber);
    })
  );

  return blocks.map((block) => +block.timestamp);
}
