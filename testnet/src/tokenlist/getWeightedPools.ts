import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";


import { TokenListTag } from "src/tokenlist/tags";
import { WeightedPoolFactory__factory } from "src/types/factories/WeightedPoolFactory__factory";
import { WeightedPool__factory } from "src/types/factories/WeightedPool__factory";

export const provider = hre.ethers.provider;
export async function getWeightedPools(weightedPoolFactoryAddress: string, chainId: number, safelist: string[]) {
  const poolFactory = WeightedPoolFactory__factory.connect(weightedPoolFactoryAddress, provider);
  const filter = poolFactory.filters.PoolCreated(null);
  const events = await poolFactory.queryFilter(filter);
  const poolCreatedEvents = events.map(
    (event) => {
      const [poolAddress] = event.args || [];
      return { poolAddress};
    }
  );

  const safePoolEvents = poolCreatedEvents.filter(( { poolAddress } ) => safelist.includes(poolAddress));
  const safePoolAddresses = safePoolEvents.map(( { poolAddress } ) => poolAddress);
  const safePools = safePoolAddresses.map((poolAddress) => WeightedPool__factory.connect(poolAddress, provider));

  const poolIds = await Promise.all(safePools.map(pool => pool.getPoolId()));
  const poolNames = await Promise.all(safePools.map(pool => pool.name()));
  const poolSymbols = await Promise.all(safePools.map(pool => pool.symbol()));
  const poolDecimals = await Promise.all(safePools.map(pool => pool.decimals()));

  const weightedPoolTokensList: TokenInfo[] = zip<any>(
    safePoolAddresses, poolSymbols, poolNames, poolDecimals,   poolIds, )
    .map(([address, symbol, name, decimal,    poolId]): TokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        extensions: {
          poolId: poolId as string,
        },
        name: name as string,
        tags: [TokenListTag.WPOOL],
        // TODO: What logo do we want to show for wpool tokens?
        // logoURI: ""
      };
    });

  return weightedPoolTokensList;
}


