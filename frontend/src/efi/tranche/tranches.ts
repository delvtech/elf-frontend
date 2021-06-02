import { TokenInfo } from "@uniswap/token-lists";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { TestYVault } from "elf-contracts/types/TestYVault";
import { Tranche } from "elf-contracts/types/Tranche";
import keyBy from "lodash.keyby";
import {
  AssetProxyTokenInfo,
  PrincipalTokenInfo,
  TokenListTag,
} from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { getTokenInfo, tokenListJson } from "efi/tokenlists";
import { vaultContractsByAddress } from "efi/tranche/vaults";

export const principalTokenInfos: PrincipalTokenInfo[] =
  tokenListJson.tokens.filter((tokenInfo): tokenInfo is PrincipalTokenInfo =>
    isPrincipalToken(tokenInfo)
  );

export const trancheContracts = getSmartContractFromRegistryMulti(
  principalTokenInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

export const trancheContractsByAddress = keyBy(
  trancheContracts,
  (tranche) => tranche.address
);

export const openPrincipalTokens = principalTokenInfos.filter(
  ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > Date.now()
);

/**
 * The list of tranches that are currently running.
 */
export const openTranches = getSmartContractFromRegistryMulti(
  openPrincipalTokens.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

export function isPrincipalToken(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenListTag.PRINCIPAL);
}

export function getVaultForTranche(trancheAddress: string): TestYVault {
  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(trancheAddress);

  const {
    extensions: { vault },
  } = getTokenInfo<AssetProxyTokenInfo>(position);

  const vaultContract = vaultContractsByAddress[vault];

  return vaultContract;
}
