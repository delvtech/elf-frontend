import ContractAddresses from "efi/addresses/addresses";
import { ETH_ZERO_ADDRESS } from "efi/ethereum/ethereum";

export const BALANCER_ETH_SENTINEL = ETH_ZERO_ADDRESS;

export function mapETHSentinalToWETH(address: string): string {
  if (address === BALANCER_ETH_SENTINEL) {
    return ContractAddresses.wethAddress;
  }

  return address;
}

export function mapWETHToETHSentinal(address: string): string {
  if (address === ContractAddresses.wethAddress) {
    return BALANCER_ETH_SENTINEL;
  }

  return address;
}
