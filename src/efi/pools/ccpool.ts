import { TokenInfo } from "@uniswap/token-lists";
import { ConvergentCurvePool } from "elf-contracts-typechain/dist/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts-typechain/dist/types/factories/ConvergentCurvePool__factory";
import keyBy from "lodash.keyby";

import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists/tokenlists";
import { PrincipalPoolTokenInfo } from "@elementfi/tokenlist";
import { TokenTag } from "@elementfi/tokenlist/dist/tags";

/**
 * The list of all principal token pools. This includes pools with mature
 * principal tokens.
 */
export const principalPools: PrincipalPoolTokenInfo[] =
  tokenListJson.tokens.filter(
    (tokenInfo): tokenInfo is PrincipalPoolTokenInfo =>
      isPrincipalPool(tokenInfo)
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
  return !!tokenInfo.tags?.includes(TokenTag.CCPOOL);
}
export function getPoolInfoForPrincipalToken(
  principalTokenAddress: string
): PrincipalPoolTokenInfo {
  return principalPools.find(
    ({ extensions: { bond } }) => bond === principalTokenAddress
  ) as PrincipalPoolTokenInfo;
}

export function getPrincipalPoolContractForTranche(
  trancheAddress: string
): ConvergentCurvePool {
  const pool = getPoolInfoForPrincipalToken(trancheAddress);
  const poolContract = principalPoolContractsByAddress[pool.address];
  return poolContract;
}
