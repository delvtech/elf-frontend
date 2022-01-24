import { AssetProxyTokenInfo, PrincipalTokenInfo } from "@elementfi/tokenlist";
import { TokenTag } from "@elementfi/tokenlist/dist/tags";
import { TokenInfo } from "@uniswap/token-lists";
import { YVaultAssetProxy__factory } from "elf-contracts-typechain/dist/types/factories/YVaultAssetProxy__factory";
import keyBy from "lodash.keyby";

import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists/tokenlists";

export const assetProxyTokenInfos: AssetProxyTokenInfo[] =
  tokenListJson.tokens.filter((tokenInfo): tokenInfo is AssetProxyTokenInfo =>
    isAssetProxy(tokenInfo)
  );

const assetProxyContracts = assetProxyTokenInfos.map(({ address }) =>
  YVaultAssetProxy__factory.connect(address, defaultProvider)
);

export const assetProxyContractsByAddress = keyBy(
  assetProxyContracts,
  (position) => position.address
);

function isAssetProxy(tokenInfo: TokenInfo): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo.tags?.includes(TokenTag.ASSET_PROXY);
}
