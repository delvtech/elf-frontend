import { queryCache, useMutation, useQuery } from "react-query";

import { useWeb3React } from "@web3-react/core";
import { BigNumber, ContractTransaction } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import {
  showTransactionFailedToast,
  showTransactionSuccessfulToast,
} from "efi-ui/crypto/toasts/transactionToasts";
import ContractAddresses from "efi/contracts/contractsJson";
import {
  elfContract,
  fetchBalanceOf,
  fetchContractAssetBalances,
  fetchContractAssetSymbols,
  fetchDecimals,
  postDeposit,
  postDepositEth,
  postWithdraw,
  postWithdrawEth,
} from "efi/contracts/Elf";
import { postApprove } from "efi/contracts/token";
import { StakingTokens } from "efi/crypto/stakingAssets";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenContracts } from "efi/crypto/TokenContracts";

const contractAssetSymbolsKey = ["contract", "elf", "assetSymbols"];
export function useElfContractAssetSymbols() {
  return useQuery(contractAssetSymbolsKey, () => fetchContractAssetSymbols());
}

const contractAssetBalancesKey = ["contract", "elf", "assetBalances"];
export function useElfContractAssetBalances() {
  return useQuery(contractAssetBalancesKey, () => fetchContractAssetBalances());
}

// TODO: refactor this to be a wrapper for useERC20Balance hook
export function useElfContractBalance(
  account: string | undefined | null
): TokenBalance | undefined {
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
  return [["contract", "elf", "balanceOf"], { account }];
}

export function useElfContractTotalSupply() {
  return useSmartContractReadCall(elfContract, "totalSupply");
}

function makeContractDecimalsKey(account: string | undefined | null) {
  return [["contract", "elf", "decimals"], { account }];
}

export function useElfContractSymbol() {
  return useSmartContractReadCall(elfContract, "symbol");
}

interface ElfDepositEthVariables {
  amount: BigNumber;
  account: string;
}

export function useElfContractDepositEth() {
  const { library } = useWeb3React();
  const signer = library?.getSigner();

  return useMutation<
    ContractTransaction | undefined,
    unknown,
    ElfDepositEthVariables
  >(
    (variables) => {
      const { amount } = variables;
      return postDepositEth(signer, amount);
    },
    {
      onSuccess: (transaction, { account }) => {
        if (transaction) {
          showTransactionSuccessfulToast(transaction);
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
}

interface ElfApproveDepositVariables {
  token: StakingTokens;
  account: string;
  amount: BigNumber;
}

// TODO: refactor this to be generic for tokens and just pass elf contract address in as argument
// TODO: refactor these to have the library passed in, don't want to use closure variables for useMutation
export function useElfContractApproveDeposit() {
  const { library } = useWeb3React();

  return useMutation<
    ContractTransaction | undefined,
    unknown,
    ElfApproveDepositVariables
  >(
    async ({ token, amount }) => {
      const contract = TokenContracts[token];
      const signer = library?.getSigner();
      if (!signer) {
        return;
      }
      return postApprove(signer, contract, ContractAddresses.ELF, amount);
    },
    {
      onSuccess: (transaction, { account }) => {
        if (transaction) {
          showTransactionSuccessfulToast(transaction);
        }
        const contractBalanceKey = makeElfContractBalanceKey(account);
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        showTransactionFailedToast();
        console.error(
          "There was an error depositing asset in the Elf Strategy.",
          error
        );
      },
    }
  );
}

interface ElfDepositVariables {
  amount: BigNumber;
  account: string;
}

export function useElfContractDeposit() {
  const { library } = useWeb3React();
  const signer = library?.getSigner();

  return useMutation<
    ContractTransaction | undefined,
    unknown,
    ElfDepositVariables
  >(
    async ({ amount }) => {
      return postDeposit(signer, amount);
    },
    {
      onSuccess: (transaction, { account }) => {
        if (transaction) {
          showTransactionSuccessfulToast(transaction);
        }
        if (!account) {
          return;
        }
        const contractBalanceKey = makeElfContractBalanceKey(account);
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        showTransactionFailedToast();
        console.error(
          "There was an error depositing asset in the Elf Strategy.",
          error
        );
      },
    }
  );
}

interface ElfWithdrawEthVariables {
  amount: BigNumber;
  account: string | undefined | null;
}
export function useElfContractWithdrawEth() {
  const { library } = useWeb3React();
  const signer = library?.getSigner();

  return useMutation<
    ContractTransaction | undefined,
    unknown,
    ElfWithdrawEthVariables
  >(
    async ({ amount }) => {
      return postWithdrawEth(signer, amount);
    },
    {
      onSuccess: (transaction, { account }) => {
        if (transaction) {
          showTransactionSuccessfulToast(transaction);
        }
        if (!account) {
          return;
        }
        const contractBalanceKey = makeElfContractBalanceKey(account);
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        showTransactionFailedToast();
        console.error(
          "There was an error withdrawing Eth from the Elf Strategy.",
          error
        );
      },
    }
  );
}

interface ElfWithdrawVariables {
  amount: BigNumber;
  account: string | undefined | null;
}

export function useElfContractWithdraw() {
  const { library } = useWeb3React();
  const signer = library?.getSigner();

  return useMutation<
    ContractTransaction | undefined,
    unknown,
    ElfWithdrawVariables
  >(
    async ({ amount }) => {
      return postWithdraw(signer, amount);
    },
    {
      onSuccess: (result, { account }) => {
        if (!account) {
          return;
        }
        const contractBalanceKey = makeElfContractBalanceKey(account);
        queryCache.invalidateQueries(contractBalanceKey);
      },
      onError: (error) => {
        showTransactionFailedToast();
        console.error(
          "There was an error withdrawing wETH from the Elf Strategy.",
          error
        );
      },
    }
  );
}
