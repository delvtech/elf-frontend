import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";

import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { TokenListTag } from "src/tokenlist/tags";
import { ERC20 } from "src/types/ERC20";
import { UnderlyingTokenInfo } from "src/tokenlist/types";
import { Tranche } from "src/types/Tranche";

export const provider = hre.ethers.provider;
export async function getAssetProxies(tranches: Tranche[], chainId: number) {
  const names = await getTokenNameMulti(tranches);
  const symbols = await getTokenSymbolMulti(tranches);
  const decimals = await getTokenDecimalsMulti(tranches);

  const trancheAddresses = tranches.map((tranche) => tranche.address);
  const assetProxyTokensList: TokenInfo[] = zip(
    trancheAddresses,
    symbols,
    names,
    decimals
  ).map(
    ([address, symbol, name, decimal]): UnderlyingTokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        tags: [TokenListTag.ASSET_PROXY],
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
