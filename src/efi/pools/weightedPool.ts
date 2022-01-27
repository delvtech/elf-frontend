import { TokenInfo } from "@uniswap/token-lists";
import { WeightedPool__factory } from "elf-contracts-typechain/dist/types/factories/WeightedPool__factory";
import { WeightedPool } from "elf-contracts-typechain/dist/types/WeightedPool";
import keyBy from "lodash.keyby";

import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists/tokenlists";
import { YieldPoolTokenInfo } from "@elementfi/tokenlist";
import { TokenTag } from "@elementfi/tokenlist/dist/tags";

// hard limit set by Balancer.  Cannot trade in/out more than 30% of the pool
export const MAX_WEIGHTED_POOL_PRICE_IMPACT = 0.3;

export enum WeightedPoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
}

export const yieldPools: YieldPoolTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is YieldPoolTokenInfo => isYieldPool(tokenInfo)
);

export const yieldPoolContracts = yieldPools.map(({ address }) =>
  WeightedPool__factory.connect(address, defaultProvider)
);

export const yieldPoolContractsByAddress = keyBy(
  yieldPoolContracts,
  (yieldPool) => yieldPool.address
);

export function getPoolForYieldToken(
  yieldTokenAddress: string
): WeightedPool | undefined {
  const yieldPool = yieldPools.find(
    ({ extensions: { interestToken } }) => interestToken === yieldTokenAddress
  ) as YieldPoolTokenInfo;

  return yieldPoolContractsByAddress[yieldPool.address];
}

export function getPoolInfoForYieldToken(
  yieldTokenAddress: string
): YieldPoolTokenInfo | undefined {
  const yieldPoolInfo = yieldPools.find(
    ({ extensions: { interestToken } }) => interestToken === yieldTokenAddress
  ) as YieldPoolTokenInfo;

  return yieldPoolInfo;
}

export function isYieldPool(
  tokenInfo: TokenInfo
): tokenInfo is YieldPoolTokenInfo {
  return !!tokenInfo.tags?.includes(TokenTag.WPOOL);
}
