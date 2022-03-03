import { ETHERSCAN_DOMAIN } from "integrations/efi-etherscan/ETHERSCAN_DOMAIN";

export function makeEtherscanWalletAddressUrl(account: string): string {
  return `${ETHERSCAN_DOMAIN}/address/${account}`;
}

export function makeEtherscanTokenUrl(tokenAddress: string): string {
  return `${ETHERSCAN_DOMAIN}/token/${tokenAddress}`;
}
