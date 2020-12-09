import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export type StakingAssets = StakingCoins | StakingTokens;
export type StakingCoins = Extract<CryptoSymbol, "ETH">;
export type StakingTokens = Extract<CryptoSymbol, "WETH">;

export const stakingAssets: StakingAssets[] = ["ETH", "WETH"];
