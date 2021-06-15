import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";

import { TokenListTag, YieldPoolTokenInfo } from "src/tokenlist/types";
import { Vault__factory } from "src/types/factories/Vault__factory";
import { WeightedPoolFactory__factory } from "src/types/factories/WeightedPoolFactory__factory";
import { WeightedPool__factory } from "src/types/factories/WeightedPool__factory";
import { WeightedPool } from "src/types/WeightedPool";

export const provider = hre.ethers.provider;
export async function getWeightedPools(
  wethAddress: string,
  usdcAddress: string,
  vaultAddress: string,
  weightedPoolFactoryAddress: string,
  chainId: number,
  safelist: string[]
) {
  const vault = Vault__factory.connect(vaultAddress, provider);
  const poolFactory = WeightedPoolFactory__factory.connect(
    weightedPoolFactoryAddress,
    provider
  );
  const filter = poolFactory.filters.PoolCreated(null);
  const events = await poolFactory.queryFilter(filter);
  const poolCreatedEvents = events.map((event) => {
    const [poolAddress] = event.args || [];
    const { blockNumber } = event;
    return { poolAddress, blockNumber };
  });

  const safePoolEvents = poolCreatedEvents.filter(({ poolAddress }) =>
    safelist.includes(poolAddress)
  );
  const safePoolAddresses = safePoolEvents.map(
    ({ poolAddress }) => poolAddress
  );
  const safePools = safePoolAddresses.map((poolAddress) =>
    WeightedPool__factory.connect(poolAddress, provider)
  );

  const poolCreatedAts = await Promise.all(
    safePoolEvents.map(async ({ blockNumber }) => {
      const block = await provider.getBlock(blockNumber as number);
      return +block.timestamp;
    })
  );
  const poolIds = await Promise.all(safePools.map((pool) => pool.getPoolId()));
  const poolNames = await Promise.all(safePools.map((pool) => pool.name()));
  const underlyingAddresses = await Promise.all(
    zip(safePools, poolIds).map(async (zipped) => {
      const [pool, poolId] = zipped as [WeightedPool, string];
      const [tokenAddresses] = await vault.getPoolTokens(poolId);
      return tokenAddresses.find((address) =>
        [wethAddress, usdcAddress].includes(address)
      ) as string;
    })
  );
  const interestTokenAddresses = await Promise.all(
    zip(safePools, poolIds).map(async (zipped) => {
      const [pool, poolId] = zipped as [WeightedPool, string];
      const [tokenAddresses] = await vault.getPoolTokens(poolId);
      const interestToken = tokenAddresses.find(
        (address) => ![wethAddress, usdcAddress].includes(address)
      ) as string;
      return interestToken;
    })
  );
  const poolSymbols = await Promise.all(safePools.map((pool) => pool.symbol()));
  const poolDecimals = await Promise.all(
    safePools.map((pool) => pool.decimals())
  );

  const weightedPoolTokensList: TokenInfo[] = zip<any>(
    safePoolAddresses,
    poolSymbols,
    poolNames,
    poolDecimals,
    poolIds,
    underlyingAddresses,
    interestTokenAddresses,
    poolCreatedAts
  ).map(
    ([
      address,
      symbol,
      name,
      decimal,
      poolId,
      underlying,
      interestToken,
      poolCreatedAt,
    ]): YieldPoolTokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        extensions: {
          poolId: poolId as string,
          underlying: underlying as string,
          interestToken: interestToken as string,
          createdAtTimestamp: poolCreatedAt as number,
        },
        name: name as string,
        tags: [TokenListTag.WPOOL],
        // TODO: What logo do we want to show for wpool tokens?
        // logoURI: ""
      };
    }
  );

  return weightedPoolTokensList;
}
