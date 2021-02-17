import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

export type StakingAssets = StakingCoins | StakingTokens;
export type StakingCoins = Extract<CryptoSymbolOld, "ETH">;
export type StakingTokens = Extract<CryptoSymbolOld, "WETH">;

export const stakingAssets: StakingAssets[] = ["ETH", "WETH"];
