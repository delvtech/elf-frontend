import { useQuery } from "react-query";
import {
  fetchBalance,
  fetchContractName,
  fetchDecimals,
  fetchSymbol,
} from "efi/contracts/Elf";

// Keys are arrays so that we can do things like prefix-matching to invalidate
// queries elsewhere. We should expect to export these keys as needed.
const contractNameKey = ["contract", "elf", "name"];
export function useElfContractName() {
  return useQuery(contractNameKey, fetchContractName);
}

const contractBalanceKey = ["contract", "elf", "balance"];
export function useElfContractBalance() {
  return useQuery(contractBalanceKey, () => fetchBalance());
}

const contractDecimalsKey = ["contract", "elf", "decimals"];
export function useElfContractDecimals() {
  return useQuery(contractDecimalsKey, () => fetchDecimals());
}

const contractGovernanceKey = ["contract", "elf", "governance"];
export function useElfContractSymbol() {
  return useQuery(contractGovernanceKey, () => fetchSymbol());
}
