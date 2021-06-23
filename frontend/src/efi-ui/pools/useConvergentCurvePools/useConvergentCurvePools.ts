import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { principalPools } from "efi/pools/ccpool";

export interface PrincipalTokenPoolInfoWithContract
  extends PrincipalPoolTokenInfo {
  contract: ConvergentCurvePool;
}

export const principalTokenPools: PrincipalTokenPoolInfoWithContract[] =
  principalPools.map((info) => {
    const contract = getSmartContractFromRegistry(
      info.address,
      ConvergentCurvePool__factory.connect
    ) as ConvergentCurvePool;
    return {
      ...info,
      contract,
    };
  });
