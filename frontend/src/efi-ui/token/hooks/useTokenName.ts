import { Erc20 } from "elf-contracts/types/Erc20";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenName(contract: Erc20) {
  return useSmartContractReadCall(contract, "name");
}

export function useTokenDecimals(contract: Erc20) {
  return useSmartContractReadCall(contract, "decimals");
}
