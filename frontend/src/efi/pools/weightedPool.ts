import { TokenInfo } from "@uniswap/token-lists";
import { WeightedPool__factory } from "elf-contracts/types/factories/WeightedPool__factory";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { TokenListTag, YieldPoolTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { tokenListJson } from "efi/tokenlists";
import keyBy from "lodash.keyby";

export enum WeightedPoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
}

export const yieldPools: YieldPoolTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is YieldPoolTokenInfo => isYieldPool(tokenInfo)
);
export const openYieldPools: YieldPoolTokenInfo[] = yieldPools.filter(
  (yieldPool) => yieldPool.extensions.expiration * 1000 > Date.now()
);

export const yieldPoolContracts = getSmartContractFromRegistryMulti(
  yieldPools.map(({ address }) => address),
  WeightedPool__factory.connect
) as WeightedPool[];

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
  return !!tokenInfo.tags?.includes(TokenListTag.WPOOL);
}
