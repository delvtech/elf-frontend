import { queryCache, useMutation, useQuery } from "react-query";

import { BigNumber } from "ethers";

import {
  estimateGasForDepositEth,
  fetchBalance,
  fetchContractAssetBalances,
  fetchContractAssetSymbols,
  fetchContractName,
  fetchDecimals,
  fetchSymbol,
  fetchTotalSupply,
  postDepositEth,
  postWithdrawEth,
} from "efi/contracts/Elf";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";

// Keys are arrays so that we can do things like prefix-matching to invalidate
// queries elsewhere. We should expect to export these keys as needed.
const contractNameKey = ["contract", "elf", "name"];
export function useElfContractName() {
  return useQuery(contractNameKey, fetchContractName);
}

const contractAssetSymbolsKey = ["contract", "elf", "assetSymbols"];
export function useElfContractAssetSymbols() {
  return useQuery(contractAssetSymbolsKey, () => fetchContractAssetSymbols());
}

const contractAssetBalancesKey = ["contract", "elf", "assetBalances"];
export function useElfContractAssetBalances() {
  return useQuery(contractAssetBalancesKey, () => fetchContractAssetBalances());
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

interface ElfDepositEth {
  gasEstimate: any;
  depositEth: any;
}

const contractDepositEthGasEstimateKey = [
  "contract",
  "elf",
  "depositEth",
  "gasEstimate",
];

export function useElfContractDepositEth(): ElfDepositEth {
  const { library } = useWallet();
  const signer = library?.getSigner();
  const gasEstimate = useQuery(contractDepositEthGasEstimateKey, () => {
    if (!signer) {
      return new Promise(() => {});
    }

    return estimateGasForDepositEth(signer);
  });
  const depositEth = useMutation(
    (amount: BigNumber) => {
      if (!signer) {
        return new Promise(() => {});
      }
      return postDepositEth(signer, amount);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        console.error(
          "There was an error depositing Eth in the Elf Strategy.",
          error
        );
      },
    }
  );

  return { gasEstimate, depositEth };
}

export function useElfContractWithdrawEth() {
  const { library } = useWallet();
  return useMutation(
    async (amount: BigNumber) => {
      if (!library) {
        return {};
      }
      const signer = library.getSigner();
      return postWithdrawEth(signer, amount);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        console.error(
          "There was an error depositing Eth in the Elf Strategy.",
          error
        );
      },
    }
  );
}
