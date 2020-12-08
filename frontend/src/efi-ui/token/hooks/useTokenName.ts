import { Erc20 } from "elf-contracts/types/Erc20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenName<TContract extends Erc20>(contract: TContract) {
  return useSmartContractReadCall(contract, "name");
}

export function useTokenDecimals<TContract extends Erc20>(contract: TContract) {
  return useSmartContractReadCall(contract, "decimals");
}
