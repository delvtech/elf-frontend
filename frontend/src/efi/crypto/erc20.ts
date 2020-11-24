import { Contract } from "ethers";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import erc20abi from "efi/crypto/erc20abi.json";

export type ERC20TokenSymbol = Extract<
  CryptoSymbol,
  CryptoSymbol.WETH | CryptoSymbol.USDC
>;

export const UNI_CONTRACT_ADDRESS_MAINNET =
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
export const USDC_CONTRACT_ADDRESS_MAINNET =
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

export const WETH_CONTRACT_ADDRESS_MAINNET =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

export const ERC20ContractsByName: Record<ERC20TokenSymbol, Contract> = {
  [CryptoSymbol.WETH]: new Contract(WETH_CONTRACT_ADDRESS_MAINNET, erc20abi),
  [CryptoSymbol.USDC]: new Contract(USDC_CONTRACT_ADDRESS_MAINNET, erc20abi),
};
