import { Elf } from "elf-contracts/types/Elf";
import { Elf__factory } from "elf-contracts/types/factories/Elf__factory";
import {
  BigNumber,
  ContractFunction,
  ContractTransaction,
  Signer,
} from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { ContractMethodArgs, ContractMethodName } from "./types";

interface ElfStubs {
  functions: {
    assetBalances(): Promise<[BigNumber[]]>;
    assetSymbols(): Promise<[string[]]>;
  };
}

type ElfWithStubs = Elf & ElfStubs;

export const elfContract = Elf__factory.connect(
  ContractAddresses.elfUsdcAddress,
  jsonRpcProvider
) as ElfWithStubs;

// stub out call to get asset symbols
elfContract.functions.assetSymbols = async (): Promise<[CryptoSymbolOld[]]> => [
  ["yDAI", "yTUSD", "yUSDC", "yUSDT"],
];
// stub out call to get asset balances
elfContract.functions.assetBalances = async () => [
  [BigNumber.from(100), BigNumber.from(200), BigNumber.from(100)],
];

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

export async function fetchDecimals(): Promise<number> {
  const result = await elfContract.functions.decimals();
  return result[0];
}
export async function estimateGasForMethod<
  TMethodName extends ContractMethodName<Elf>,
  TCallArgs extends ContractMethodArgs<Elf, TMethodName>
>(
  methodName: TMethodName,
  callArgs?: TCallArgs
): Promise<BigNumber | undefined> {
  // type cast here because typescript can't resolve which method this is and therefore which
  // callArgs are correct. the caller of this function will still have typesafe inputs though.
  return (elfContract.estimateGas[methodName] as ContractFunction<any>)(
    ...(callArgs as any[])
  );
}

export async function estimateGasForDeposit(
  signer: Signer | undefined
): Promise<BigNumber | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  const address = await signer.getAddress();
  // The value doesn't affect the gas estimate, just stick in one ether.
  return elfWithSigner.estimateGas.deposit(address, ONE_ETHER);
}

/**
 * @deprecated depositing ETH directly into Elf is no longer supported. This is a noop.
 */
export async function postDepositEth(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<undefined> {
  return undefined;
}

export async function postDeposit(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elfContract.connect(signer);
  const address = await signer.getAddress();
  const result = elfWithSigner.functions.deposit(address, amount);
  return result;
}

/**
 * @deprecated withdrawing ETH directly into Elf is no longer supported. This is a noop.
 */
export async function postWithdrawEth(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<undefined> {
  return undefined;
}
