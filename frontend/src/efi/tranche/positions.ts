import { TokenInfo } from "@uniswap/token-lists";
import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import keyBy from "lodash.keyby";
import {
  PrincipalTokenInfo,
  AssetProxyTokenInfo,
  TokenListTag,
} from "tokenlists/types";

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
  return !!tokenInfo.tags?.includes(TokenListTag.ASSET_PROXY);
}
