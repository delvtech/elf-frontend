import { TokenInfo } from "@uniswap/token-lists";
import { Tranche__factory } from "elf-contracts-typechain/dist/types/factories/Tranche__factory";
import { TestYVault } from "elf-contracts-typechain/dist/types/TestYVault";
import keyBy from "lodash.keyby";
import {
  AssetProxyTokenInfo,
  PrincipalTokenInfo,
  TokenListTag,
  VaultTokenInfo,
  YieldTokenInfo,
} from "tokenlists/types";

import { getTokenInfo, tokenListJson } from "elf/tokenlists";
import { vaultContractsByAddress } from "elf/tranche/vaults";
import { defaultProvider } from "elf/providers/providers";

export function isPrincipalToken(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenListTag.PRINCIPAL);
}

export const principalTokenInfos: PrincipalTokenInfo[] =
  tokenListJson.tokens.filter((tokenInfo): tokenInfo is PrincipalTokenInfo =>
    isPrincipalToken(tokenInfo)
  );

export const trancheContracts = principalTokenInfos.map(({ address }) =>
  Tranche__factory.connect(address, defaultProvider)
);

export const trancheContractsByAddress = keyBy(
  trancheContracts,
  (tranche) => tranche.address
);

export function getVaultContractForTranche(trancheAddress: string): TestYVault {
  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(trancheAddress);

  const {
    extensions: { vault },
  } = getTokenInfo<AssetProxyTokenInfo>(position);

  const vaultContract = vaultContractsByAddress[vault];

  return vaultContract;
}

export function getVaultTokenInfoForTranche(
  trancheAddress: string
): VaultTokenInfo {
  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(trancheAddress);

  const {
    extensions: { vault },
  } = getTokenInfo<AssetProxyTokenInfo>(position);

  const vaultTokenInfo = getTokenInfo<VaultTokenInfo>(vault);

  return vaultTokenInfo;
}

export function getYieldTokenForPrincipalToken(
  principalTokenAddress: string
): YieldTokenInfo {
  const {
    extensions: { interestToken },
  } = getTokenInfo<PrincipalTokenInfo>(principalTokenAddress);

  return getTokenInfo<YieldTokenInfo>(interestToken);
}
