import { WeightedPool, WeightedPool__factory } from "@elementfi/core-typechain";
import { TokenInfo, TokenTag, YieldPoolTokenInfo } from "@elementfi/tokenlist";
import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists/tokenlists";
import keyBy from "lodash.keyby";

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

export function getPoolForYieldToken(yieldTokenAddress: string): WeightedPool {
  const yieldPool = yieldPools.find(
    ({ extensions: { interestToken } }) => interestToken === yieldTokenAddress
  ) as YieldPoolTokenInfo;

  return yieldPoolContractsByAddress[yieldPool.address];
}

export function getPoolInfoForYieldToken(
  yieldTokenAddress: string
): YieldPoolTokenInfo {
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
