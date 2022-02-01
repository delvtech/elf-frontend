import { TestYVault__factory } from "@elementfi/core-typechain";
import { TokenInfo, VaultTokenInfo } from "@elementfi/tokenlist";
import { TokenTag } from "@elementfi/tokenlist/dist/tags";
import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists/tokenlists";
import { assetProxyTokenInfos } from "efi/tranche/positions";
import keyBy from "lodash.keyby";

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
