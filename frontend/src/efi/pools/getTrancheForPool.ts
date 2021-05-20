import { Provider } from "@ethersproject/providers";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { PrincipalTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistryStatic } from "efi/contracts/SmartContractsRegistry";
import { isPrincipalPool } from "efi/pools/ccpool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { PrincipalTokenInfos } from "efi/tranche/tranches";

export function getTrancheForPool(
  poolInfo: PoolInfo,
  signerOrProvider?: Signer | Provider
): Tranche {
  if (isPrincipalPool(poolInfo)) {
    const trancheAddress = poolInfo.extensions.bond;
    const trancheContract = getSmartContractFromRegistryStatic(
      trancheAddress,
      Tranche__factory,
      signerOrProvider
    );

    return trancheContract;
  }

  const interestTokenAddress = poolInfo.extensions.interestToken;
  const trancheInfo = PrincipalTokenInfos.find(
    (info) => info.extensions.interestToken === interestTokenAddress
  ) as PrincipalTokenInfo;
  const trancheAddress = trancheInfo.address;

  const trancheContract = getSmartContractFromRegistryStatic(
    trancheAddress,
    Tranche__factory
  );

  return trancheContract;
}
