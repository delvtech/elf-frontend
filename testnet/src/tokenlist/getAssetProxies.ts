import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import uniq from "lodash.uniq";
import zip from "lodash.zip";

import { ERC20 } from "src/types/ERC20";
import { YVaultAssetProxy__factory } from "src/types/factories/YVaultAssetProxy__factory";
import { Tranche } from "src/types/Tranche";

import {
  AssetProxyTokenInfo,
  TokenListTag,
  UnderlyingTokenInfo,
} from "src/tokenlist/types";

export const provider = hre.ethers.provider;
export async function getAssetProxies(
  tranches: Tranche[],
  chainId: number
): Promise<AssetProxyTokenInfo[]> {
  const allPositions = await Promise.all(
    tranches.map((tranche) => tranche.position())
  );
  // uniq b/c different tranches can have the same positionj
  const uniqPositionAddresses = uniq(allPositions);
  const positions = uniqPositionAddresses.map((address) =>
    YVaultAssetProxy__factory.connect(address, provider)
  );

  const vaults = await Promise.all(
    positions.map((position) => position.vault())
  );
  const names = await getTokenNameMulti((positions as unknown) as ERC20[]);
  const symbols = await getTokenSymbolMulti((positions as unknown) as ERC20[]);
  const decimals = await getTokenDecimalsMulti(
    (positions as unknown) as ERC20[]
  );

  const assetProxyTokensList = zip(
    uniqPositionAddresses,
    symbols,
    names,
    decimals,
    vaults
  ).map(
    ([address, symbol, name, decimal, vault]): AssetProxyTokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        tags: [TokenListTag.ASSET_PROXY],
        extensions: { vault: vault as string },
        // TODO: What logo do we want to show for base assets?
        // logoURI: ""
      };
    }
  );

  return assetProxyTokensList;
}

async function getTokenDecimalsMulti(tokens: ERC20[]) {
  const tokenNames = await Promise.all(tokens.map((token) => token.decimals()));
  return tokenNames;
}
async function getTokenSymbolMulti(tokens: ERC20[]) {
  const tokenNames = await Promise.all(tokens.map((token) => token.symbol()));
  return tokenNames;
}
async function getTokenNameMulti(tokens: ERC20[]) {
  const tokenNames = await Promise.all(tokens.map((token) => token.name()));
  return tokenNames;
}
