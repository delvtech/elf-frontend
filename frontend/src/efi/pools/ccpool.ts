import { TokenInfo } from "@uniswap/token-lists";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import keyBy from "lodash.keyby";
import { PrincipalPoolTokenInfo, TokenListTag } from "tokenlists/types";

import { tokenListJson } from "efi/tokenlists";
import { defaultProvider } from "efi/providers/providers";

/**
 * The list of all principal token pools. This includes pools with mature
 * principal tokens.
 */
export const principalPools: PrincipalPoolTokenInfo[] =
  tokenListJson.tokens.filter(
    (tokenInfo): tokenInfo is PrincipalPoolTokenInfo =>
      isPrincipalPool(tokenInfo)
  );

/**
 * The list of all principal token pools whose pts aren't yet mature.
 */
export const openPrincipalPools: PrincipalPoolTokenInfo[] =
  principalPools.filter(
    (principalPool) => principalPool.extensions.expiration * 1000 < Date.now()
  );

export const principalPoolContracts = principalPools.map(({ address }) =>
  ConvergentCurvePool__factory.connect(address, defaultProvider)
);

export const principalPoolContractsByAddress = keyBy(
  principalPoolContracts,
  (poolContract) => poolContract.address
);

export function isPrincipalPool(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalPoolTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.CCPOOL);
}
export function getPoolInfoForPrincipalToken(
  trancheAddress: string
): PrincipalPoolTokenInfo {
  return principalPools.find(
    ({ extensions: { bond } }) => bond === trancheAddress
  ) as PrincipalPoolTokenInfo;
}

export function getPrincipalPoolContractForTranche(
  trancheAddress: string
): ConvergentCurvePool {
  const pool = getPoolInfoForPrincipalToken(trancheAddress);
  const poolContract = principalPoolContractsByAddress[pool.address];
  return poolContract;
}
