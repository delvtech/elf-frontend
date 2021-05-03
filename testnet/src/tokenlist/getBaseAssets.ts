import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";


import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { TokenListTag } from "src/tokenlist/tags";
import { ERC20 } from "src/types/ERC20";

export const provider = hre.ethers.provider;
export async function getBaseAssets(wethAddress: string, usdcAddress: string, chainId: number) {
  const baseAssetAddresses = [wethAddress, usdcAddress];
  const baseAssets  = baseAssetAddresses.map(address => ERC20__factory.connect(address, provider));


  const names = await getTokenNameMulti(baseAssets);
  const symbols = await getTokenSymbolMulti(baseAssets);
  const decimals = await getTokenDecimalsMulti(baseAssets);


  const principalTokensList: TokenInfo[] = zip(baseAssetAddresses, symbols, names, decimals)
    .map(([address, symbol, name, decimal]) => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        tags: [TokenListTag.UNDERLYING],
        // TODO: What logo do we want to show for base assets?
        // logoURI: ""
      };
    });

  return principalTokensList;

}

async function getTokenDecimalsMulti(tokens: ERC20[]) {
    const tokenNames = await Promise.all(tokens.map(token => token.decimals()));
    return tokenNames;
}
async function getTokenSymbolMulti(tokens: ERC20[]) {
    const tokenNames = await Promise.all(tokens.map(token => token.symbol()));
    return tokenNames;
}
async function getTokenNameMulti(tokens: ERC20[]) {
    const tokenNames = await Promise.all(tokens.map(token => token.name()));
    return tokenNames;
}

