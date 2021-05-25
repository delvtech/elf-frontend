import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import zip from "lodash.zip";

import { ERC20 } from "src/types/ERC20";

import { TokenListTag, VaultTokenInfo } from "src/tokenlist/types";
import { TestYVault__factory } from "src/types/factories/TestYVault__factory";

export const provider = hre.ethers.provider;

const GOERLI_CHAIN_ID = 5;

const VaultSymbolOverrides: Record<number, Record<string, string>> = {
  [GOERLI_CHAIN_ID]: {
    // these contracts have v1 vault symbols, but we want the v2 vaults on testnet
    "0xdD82595F5eB0e7477D7432B24E44be7c0252bbf1": "yvCurve-stETH",
    "0x23c3C6C06d7684207fB09076914A15B16aba02c5": "yvUSDC",
  },
};
export async function getVaults(vaultAddresses: string[], chainId: number) {
  const vaults = vaultAddresses.map((vaultAddress) =>
    TestYVault__factory.connect(vaultAddress, provider)
  );
  const vaultNames = await getTokenNameMulti((vaults as unknown) as ERC20[]);

  const vaultSymbols = await getTokenSymbolMulti(
    (vaults as unknown) as ERC20[]
  );

  const symbolOverrides = VaultSymbolOverrides[chainId] || {};
  const symbols = zip(vaultAddresses, vaultSymbols).map((zipped) => {
    const [vaultAddress, vaultSymbol] = zipped as [string, string];
    if (symbolOverrides[vaultAddress]) {
      return symbolOverrides[vaultAddress];
    }
    return vaultSymbol;
  });

  const decimals = await getTokenDecimalsMulti((vaults as unknown) as ERC20[]);

  const vaultTokensList: TokenInfo[] = zip(
    vaultAddresses,
    symbols,
    vaultNames,
    decimals
  ).map(
    ([address, symbol, name, decimal]): VaultTokenInfo => {
      return {
        chainId,
        address: address as string,
        symbol: symbol as string,
        decimals: decimal as number,
        name: name as string,
        tags: [TokenListTag.VAULT],
        // TODO: What logo do we want to show for base assets?
        // logoURI: ""
      };
    }
  );

  return vaultTokensList;
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
