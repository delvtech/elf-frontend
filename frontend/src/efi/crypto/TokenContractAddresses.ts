import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import addresses from "addresses.json";

export const UNI_CONTRACT_ADDRESS_MAINNET =
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
export const USDC_CONTRACT_ADDRESS_MAINNET =
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

export const USDC_CONTRACT_ADDRESS_LOCAL = addresses.usdcAddress;

export const WETH_CONTRACT_ADDRESS_MAINNET =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// TODO: get from contracts.json
export const WETH_CONTRACT_ADDRESS_LOCALNET =
  "0x75c7169E0f273365873650b49A75dFe6F9a9d448";

// TODO: we should use the chainId to get the correct address.
export const wethAddress =
  process.env.NODE_ENV === "production"
    ? WETH_CONTRACT_ADDRESS_MAINNET
    : WETH_CONTRACT_ADDRESS_LOCALNET;

const TokenAddresses: Record<TokenContractSymbols, string> = {
  WETH: wethAddress,
  USDC: USDC_CONTRACT_ADDRESS_MAINNET,
};

export default TokenAddresses;
