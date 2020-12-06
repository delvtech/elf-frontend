import elfAbi from "elf-contracts/contracts/Elf.json";
import { Elf } from "elf-contracts/types/Elf";
import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractTransaction,
  Signer,
} from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { TokenContracts } from "efi/crypto/TokenContracts";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

interface ElfStubs {
  functions: {
    assetBalances(): Promise<{
      0: BigNumber[];
    }>;
    assetSymbols(): Promise<{
      0: string[];
    }>;
  };
}

type ElfWithStubs = Elf & ElfStubs;

export const elfContract = new Contract(
  ContractAddresses.ELF,
  elfAbi,
  jsonRpcProvider
) as ElfWithStubs;

// stub out call to get asset symbols
elfContract.functions.assetSymbols = async (): Promise<{
  0: CryptoSymbol[];
}> => ({
  0: ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
});
// stub out call to get asset balances
elfContract.functions.assetBalances = async () => ({
  0: [BigNumber.from(100), BigNumber.from(200), BigNumber.from(100)],
});

export async function fetchContractName(): Promise<string> {
  const result = await elfContract.functions.name();
  return result[0];
}
export async function fetchContractAssetSymbols(): Promise<string[]> {
  const result = await elfContract.functions.assetSymbols();
  return result[0];
}

export async function fetchContractAssetBalances(): Promise<BigNumber[]> {
  const result = await elfContract.functions.assetBalances();
  return result[0];
}

export async function fetchBalanceOf(account: string): Promise<BigNumber> {
  const result = await elfContract.functions.balanceOf(account);
  return result[0];
}

export async function fetchTotalSupply(): Promise<BigNumber> {
  const result = await elfContract.functions.totalSupply();
  return result[0];
}

export async function fetchSymbol(): Promise<string> {
  const result = await elfContract.functions.symbol();
  return result[0];
}

export async function fetchDecimals(): Promise<number> {
  const result = await elfContract.functions.decimals();
  return result[0];
}

export async function estimateGasForDepositEth(
  signer: Signer | undefined
): Promise<BigNumber | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  return elfWithSigner.estimateGas.depositETH();
}

export async function estimateGasForDeposit(
  signer: Signer | undefined
): Promise<BigNumber | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  // The value doesn't affect the gas estimate, just stick in one ether.
  return elfWithSigner.estimateGas.deposit(ONE_ETHER);
}

export async function postDepositEth(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  const result = await elfWithSigner.functions.depositETH({
    value: amount,
  });
  return result;
}

export async function postDeposit(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  const weth = TokenContracts.WETH;
  const wethWithSigner = weth.connect(signer);
  await wethWithSigner.approve(ContractAddresses.ELF, amount);
  const result = elfWithSigner.functions.deposit(amount);
  return result;
}

export async function estimateGasForWithdrawEth(
  signer: Signer | undefined,
  amount: BigNumberish
): Promise<BigNumber | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  return elfWithSigner.estimateGas.withdrawETH(amount);
}

export async function postWithdrawEth(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  const result = await elfWithSigner.functions.withdrawETH(amount);
  return result;
}

export async function postWithdraw(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  const elfResult = await elfWithSigner.functions.withdraw(amount);
  return elfResult;
}
