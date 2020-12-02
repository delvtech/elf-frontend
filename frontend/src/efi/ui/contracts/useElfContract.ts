import { queryCache, QueryResult, useMutation, useQuery } from "react-query";

import { BigNumber, ContractTransaction } from "ethers";

import {
  estimateGasForDeposit,
  estimateGasForDepositEth,
  estimateGasForWithdrawEth,
  fetchBalanceOf,
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

import { BalanceInfo } from "../../crypto/BalanceInfo";

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

export function useElfContractBalance(
  account: string | undefined | null
): BalanceInfo | undefined {
  const contractBalanceKey = makeElfContractBalanceKey(account);
  const balanceResult = useQuery(contractBalanceKey, (key, { account }) => {
    if (!account) {
      return;
    }
    return fetchBalanceOf(account);
  });

  const decimalsResult = useQuery(
    makeContractDecimalsKey(account),
    (key, { account }) => {
      if (!account) {
        return;
      }
      return fetchDecimals();
    }
  );

  const value = balanceResult.data?.toString();
  if (balanceResult.data && decimalsResult.data) {
    return {
      value: BigNumber.from(value),
      decimals: BigNumber.from(decimalsResult.data),
    };
  }
}
export function makeElfContractBalanceKey(account: string | undefined | null) {
  return [["contract", "elf", "balance"], { account }];
}

const contractTotalSupplyKey = ["contract", "elf", "totalSupply"];
export function useElfContractTotalSupply() {
  return useQuery(contractTotalSupplyKey, () => fetchTotalSupply());
}

function makeContractDecimalsKey(account: string | undefined | null) {
  return [["contract", "elf", "decimals"], { account }];
}
export function useElfContractDecimals() {
  return useQuery(makeContractDecimalsKey, () => fetchDecimals());
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
  const { library, account } = useWallet();
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
        if (!account) {
          return;
        }
        const elfContractBalanceKey = makeElfContractBalanceKey(account);
        queryCache.invalidateQueries(elfContractBalanceKey);
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
  const { library, account } = useWallet();
  const signer = library?.getSigner();

  const gasEstimate = useQuery<BigNumber | undefined>(
    contractDepositGasEstimateKey,
    () => {
      return estimateGasForDeposit(signer);
    }
  );

  const [deposit] = useMutation(
    async (amount: BigNumber) => {
      return postDeposit(signer, amount);
    },
    {
      onSuccess: () => {
        if (!account) {
          return;
        }
        const contractBalanceKey = makeElfContractBalanceKey(account);
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
  const { library, account } = useWallet();
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
        if (!account) {
          return;
        }
        const contractBalanceKey = makeElfContractBalanceKey(account);
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
