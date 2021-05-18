import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { Signer } from "ethers";
import { PrincipalPoolTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { useMemo } from "react";
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
