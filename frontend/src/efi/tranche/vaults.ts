import { TokenInfo } from "@uniswap/token-lists";
import { TestYVault__factory } from "elf-contracts/types/factories/TestYVault__factory";
import { TestYVault } from "elf-contracts/types/TestYVault";
import keyBy from "lodash.keyby";
import { TokenListTag, VaultTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { tokenListJson } from "efi/tokenlists";
import { assetProxyTokenInfos } from "efi/tranche/positions";

export const vaultTokenInfos: VaultTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is VaultTokenInfo => isVaultToken(tokenInfo)
);
const vaultContracts = getSmartContractFromRegistryMulti(
  assetProxyTokenInfos.map(({ extensions: { vault } }) => vault),
  TestYVault__factory.connect
) as TestYVault[];

export const vaultContractsByAddress = keyBy(
  vaultContracts,
  (vault) => vault.address
);

export function isVaultToken(
  tokenInfo: TokenInfo
): tokenInfo is VaultTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenListTag.VAULT);
}
