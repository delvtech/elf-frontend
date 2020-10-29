import { queryCache, useMutation, useQuery } from "react-query";
import {
  fetchBalance,
  fetchContractName,
  fetchDecimals,
  fetchSymbol,
  fetchTotalSupply,
  postDepositEth,
} from "efi/contracts/Elf";
import { BigNumber } from "ethers";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";

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

const contractTotalSupplyKey = ["contract", "elf", "totalSupply"];
export function useElfContractTotalSupply() {
  return useQuery(contractTotalSupplyKey, () => fetchTotalSupply());
}

const contractDecimalsKey = ["contract", "elf", "decimals"];
export function useElfContractDecimals() {
  return useQuery(contractDecimalsKey, () => fetchDecimals());
}

const contractGovernanceKey = ["contract", "elf", "governance"];
export function useElfContractSymbol() {
  return useQuery(contractGovernanceKey, () => fetchSymbol());
}

export function useElfContractDepositEth() {
  const { library } = useWallet();
  return useMutation(
    (amount: BigNumber) => {
      if (!library) {
        return new Promise(() => {});
      }
      const signer = library.getSigner();
      return postDepositEth(signer, amount);
    },
    {
      onSuccess: (data, variables) => {
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (data, variables) => {
        console.error("There was an error depositing Eth in the Elf Strategy.");
      },
    }
  );
}

export function useElfContractWithdrawEth() {
  const { library } = useWallet();
  return useMutation(
    (amount: BigNumber) => {
      if (!library) {
        return new Promise(() => {});
      }
      const signer = library.getSigner();
      return postDepositEth(signer, amount);
    },
    {
      onSuccess: (data, variables) => {
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (data, variables) => {
        console.error("There was an error depositing Eth in the Elf Strategy.");
      },
    }
  );
}
