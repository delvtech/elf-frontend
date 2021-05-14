import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { Signer } from "ethers";
import { PrincipalTokenPoolInfo } from "tokenlists/types";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { principalTokenPoolInfos } from "efi/tokenlists";
import { useMemo } from "react";

export interface PrincipalTokenPoolInfoWithContract
  extends PrincipalTokenPoolInfo {
  contract: ConvergentCurvePool;
}

export const principalTokenPools: PrincipalTokenPoolInfoWithContract[] =
  principalTokenPoolInfos.map((info) => {
    const contract = getSmartContractFromRegistry(
      info.address,
      ConvergentCurvePool__factory.connect
    ) as ConvergentCurvePool;
    return {
      ...info,
      contract,
    };
  });

/**
 * @deprecated, just use principalTokenPools
 * @param signerOrProvider
 * @returns
 */
export function useConvergentCurvePools(
  signerOrProvider?: Signer | Provider
): ConvergentCurvePool[] {
  return useMemo(() => {
    return principalTokenPools.map((info) =>
      signerOrProvider ? info.contract.connect(signerOrProvider) : info.contract
    );
  }, [signerOrProvider]);
}
