import { queryCache, QueryResult, useMutation, useQuery } from "react-query";

import { BigNumber, ContractTransaction } from "ethers";

import {
  estimateGasForDeposit,
  estimateGasForDepositEth,
  estimateGasForWithdrawEth,
  fetchBalance,
  fetchContractAssetBalances,
  fetchContractAssetSymbols,
  fetchContractName,
  fetchDecimals,
  fetchSymbol,
  fetchTotalSupply,
  postDeposit,
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
  gasEstimate: QueryResult<BigNumber | undefined>;
  depositEth: (amount: BigNumber) => Promise<ContractTransaction | undefined>;
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

  const gasEstimate = useQuery<BigNumber | undefined>(
    contractDepositEthGasEstimateKey,
    () => {
      return estimateGasForDepositEth(signer);
    }
  );

  const [depositEth] = useMutation(
    (amount: BigNumber) => {
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

interface ElfDeposit {
  gasEstimate: QueryResult<BigNumber | undefined>;
  deposit: (amount: BigNumber) => Promise<ContractTransaction | undefined>;
}

const contractDepositGasEstimateKey = [
  "contract",
  "elf",
  "deposit",
  "gasEstimate",
];

export function useElfContractDeposit(): ElfDeposit {
  const { library } = useWallet();
  const signer = library?.getSigner();

  const gasEstimate = useQuery<BigNumber | undefined>(
    contractDepositGasEstimateKey,
    () => {
      return estimateGasForDeposit(signer);
    }
  );

  const [deposit] = useMutation(
    (amount: BigNumber) => {
      return postDeposit(signer, amount);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        console.error(
          "There was an error depositing asset in the Elf Strategy.",
          error
        );
      },
    }
  );

  return { gasEstimate, deposit };
}

interface ElfWithdrawEth {
  gasEstimate: QueryResult<BigNumber | undefined>;
  withdrawEth: (amount: BigNumber) => Promise<ContractTransaction | undefined>;
}

const contractWithdrawEthGasEstimateKey = [
  "contract",
  "elf",
  "withdrawEth",
  "gasEstimate",
];

export function useElfContractWithdrawEth(
  amount: BigNumber | undefined
): ElfWithdrawEth {
  const { library } = useWallet();
  const signer = library?.getSigner();

  const gasEstimate = useQuery<BigNumber | undefined>(
    contractWithdrawEthGasEstimateKey,
    () => {
      return estimateGasForWithdrawEth(signer, amount || "0");
    }
  );

  const [withdrawEth] = useMutation(
    async (amount: BigNumber) => {
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

  return { gasEstimate, withdrawEth };
}
