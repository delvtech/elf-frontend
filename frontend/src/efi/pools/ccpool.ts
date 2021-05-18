import { TokenInfo } from "@uniswap/token-lists";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import {
  PrincipalTokenInfo,
  PrincipalPoolTokenInfo,
  TokenListTag,
} from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { tokenListJson } from "efi/tokenlists";

/**
 * The list of all principal token pools
 */
export const PrincipalPools: PrincipalPoolTokenInfo[] =
  tokenListJson.tokens.filter(
    (tokenInfo): tokenInfo is PrincipalPoolTokenInfo =>
      isPrincipalPool(tokenInfo)
  );

const PrincipalPoolContracts = getSmartContractFromRegistryMulti(
  PrincipalPools.map(({ address }) => address),
  ConvergentCurvePool__factory.connect
) as ConvergentCurvePool[];

function isPrincipalPool(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.CCPOOL);
}
export function getPrincipalPoolForTranche(
  trancheAddress: string
): PrincipalPoolTokenInfo {
  return PrincipalPools.find(
    ({ extensions: { bond } }) => bond === trancheAddress
  ) as PrincipalPoolTokenInfo;
}

export function getPrincipalPoolContractForTranche(
  trancheAddress: string
): ConvergentCurvePool {
  const pool = getPrincipalPoolForTranche(trancheAddress);
  const poolContract = PrincipalPoolContracts.find(
    (contract) => contract.address === pool.address
  ) as ConvergentCurvePool;
  return poolContract;
}
