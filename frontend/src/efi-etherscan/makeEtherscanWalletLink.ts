import { ETHERSCAN_DOMAIN } from "efi-etherscan/ETHERSCAN_DOMAIN";

export function makeEtherscanWalletAddressUrl(account: string): string {
  return `${ETHERSCAN_DOMAIN}/address/${account}`;
}
