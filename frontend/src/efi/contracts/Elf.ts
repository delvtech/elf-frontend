import elfAbi from "elf-contracts/contracts/Elf.json";
import { Elf } from "elf-contracts/types/Elf";
import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractTransaction,
  Signer,
} from "ethers";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

// TODO: Get this from the environment
const ELF_ADDRESS_LOCALNET = "0xac64f6df4a679a65d62ef31E2f0568E4e99e0124";

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

const elf = new Contract(
  ELF_ADDRESS_LOCALNET,
  elfAbi,
  jsonRpcProvider
) as ElfWithStubs;

// stub out call to get asset symbols
elf.functions.assetSymbols = async () => ({
  0: [
    CryptoSymbol.YDAI,
    CryptoSymbol.YTUSD,
    CryptoSymbol.YUSDC,
    CryptoSymbol.YUSDT,
  ],
});
// stub out call to get asset balances
elf.functions.assetBalances = async () => ({
  0: [BigNumber.from(100), BigNumber.from(200), BigNumber.from(100)],
});

export async function fetchContractName(): Promise<string> {
  const result = await elf.functions.name();
  return result[0];
}
export async function fetchContractAssetSymbols(): Promise<string[]> {
  const result = await elf.functions.assetSymbols();
  return result[0];
}

export async function fetchContractAssetBalances(): Promise<BigNumber[]> {
  const result = await elf.functions.assetBalances();
  return result[0];
}

export async function fetchBalance(): Promise<BigNumber> {
  const result = await elf.functions.balance();
  return result[0];
}

export async function fetchTotalSupply(): Promise<BigNumber> {
  const result = await elf.functions.totalSupply();
  return result[0];
}

export async function fetchSymbol(): Promise<string> {
  const result = await elf.functions.symbol();
  return result[0];
}

export async function fetchDecimals(): Promise<number> {
  const result = await elf.functions.decimals();
  return result[0];
}

export async function estimateGasForDepositEth(
  signer: Signer | undefined
): Promise<BigNumber | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elf.connect(signer);
  return elfWithSigner.estimateGas.depositETH();
}

export async function postDepositEth(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elf.connect(signer);
  const result = await elfWithSigner.functions.depositETH({
    value: amount,
  });
  return result;
}

export async function estimateGasForWithdrawEth(
  signer: Signer | undefined,
  amount: BigNumberish
): Promise<BigNumber | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elf.connect(signer);
  return elfWithSigner.estimateGas.withdrawETH(amount);
}

export async function postWithdrawEth(
  signer: Signer | undefined,
  amount: BigNumber
): Promise<ContractTransaction | undefined> {
  if (!signer) {
    return undefined;
  }
  const elfWithSigner = elf.connect(signer);
  const result = await elfWithSigner.functions.withdrawETH(amount);
  return result;
}
