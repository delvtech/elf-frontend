import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import {
  PrincipalTokenPoolInfo,
  PrincipalTokenPoolInfos,
} from "efi/tokenlists";

export interface PrincipalTokenPoolInfoWithContract
  extends PrincipalTokenPoolInfo {
  contract: ConvergentCurvePool;
}

export const principalTokenPools: PrincipalTokenPoolInfoWithContract[] = PrincipalTokenPoolInfos.map(
  (info) => {
    const contract = getSmartContractFromRegistry(
      info.address,
      ConvergentCurvePool__factory.connect
    ) as ConvergentCurvePool;
    return {
      ...info,
      contract,
    };
  }
);

/**
 * @deprecated, just use principalTokenPools
 * @param signerOrProvider
 * @returns
 */
export function useConvergentCurvePools(): ConvergentCurvePool[] {
  return principalTokenPools.map((info) => info.contract);
}
