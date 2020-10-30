import elfAbi from "elf-contracts/contracts/Elf.json";
import { Elf } from "elf-contracts/types/Elf";
import {
  BigNumber,
  Contract,
  ContractTransaction,
  providers,
  Signer,
} from "ethers";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

// TODO: Get this from the environment
const RPC_HOST = "http://127.0.0.1:8545";

// TODO: Get this from the environment
const ELF_ADDRESS = "0xddc0543eBD9b9DD61222407d95Ce5eB9A32e3560";

const provider = new providers.JsonRpcProvider(RPC_HOST);

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

const elf = (new Contract(
  ELF_ADDRESS,
  elfAbi,
  provider
) as any) as ElfWithStubs;

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

export async function postDepositEth(
  signer: Signer,
  amount: BigNumber
): Promise<ContractTransaction> {
  const elfWithSigner = elf.connect(signer);
  const result = await elfWithSigner.functions.depositETH({
    value: amount,
  });
  return result;
}

export async function postWithdrawEth(
  signer: Signer,
  amount: BigNumber
): Promise<ContractTransaction> {
  const elfWithSigner = elf.connect(signer);
  const result = await elfWithSigner.functions.withdrawETH(amount);
  return result;
}
