import { TestYVault__factory } from "elf-contracts-typechain/dist/types/factories/TestYVault__factory";
import keyBy from "lodash.keyby";

import { tokenListJson } from "efi/tokenlists/tokenlists";
import { assetProxyTokenInfos } from "efi/tranche/positions";
import { defaultProvider } from "efi/providers/providers";
import { TokenTag } from "@elementfi/tokenlist/dist/tags";
import { TokenInfo, VaultTokenInfo } from "@elementfi/tokenlist";

export const vaultTokenInfos: VaultTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo) => isVaultToken(tokenInfo)
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
  return !!tokenInfo?.tags?.includes(TokenTag.VAULT);
}
