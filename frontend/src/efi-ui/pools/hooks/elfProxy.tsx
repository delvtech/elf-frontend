import { Erc20 } from "elf-contracts/types/Erc20";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { elfProxyContract } from "efi/contracts/elfProxy";

export function useElfProxyGetPoolAPY(pool: Erc20) {
  return useSmartContractReadCall(elfProxyContract, "getPoolAPY", [
    pool.address,
  ]);
}

export function useElfProxyGetPoolAllocations(pool: Erc20) {
  return useSmartContractReadCall(elfProxyContract, "getPoolAllocations", [
    pool.address,
  ]);
}
