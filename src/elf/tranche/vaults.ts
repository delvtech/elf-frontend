import { TokenInfo } from "@uniswap/token-lists";
import { TestYVault__factory } from "elf-contracts-typechain/dist/types/factories/TestYVault__factory";
import keyBy from "lodash.keyby";
import { TokenListTag, VaultTokenInfo } from "tokenlists/types";

import { tokenListJson } from "elf/tokenlists";
import { assetProxyTokenInfos } from "elf/tranche/positions";
import { defaultProvider } from "elf/providers/providers";

export const vaultTokenInfos: VaultTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is VaultTokenInfo => isVaultToken(tokenInfo)
);
const vaultContracts = assetProxyTokenInfos.map(({ extensions: { vault } }) =>
  TestYVault__factory.connect(vault, defaultProvider)
);

export const vaultContractsByAddress = keyBy(
  vaultContracts,
  (vault) => vault.address
);

export function isVaultToken(
  tokenInfo: TokenInfo
): tokenInfo is VaultTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenListTag.VAULT);
}
