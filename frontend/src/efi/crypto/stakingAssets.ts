import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export type StakingAssets = Extract<CryptoSymbol, "ETH" | "WETH">;

export const stakingAssets: StakingAssets[] = ["ETH", "WETH"];
