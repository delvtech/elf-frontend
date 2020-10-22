import {
  providers,
  BigNumberish,
  Overrides,
  Contract,
  ContractTransaction,
  BigNumber,
} from "ethers";
import { Elf } from "elf-contracts/types/Elf";
import elfAbi from "elf-contracts/contracts/Elf.json";

// TODO: Get this from the environment
const RPC_HOST = "http://127.0.0.1:8545";

// TODO: Get this from the environment
const ELF_ADDRESS = "0xddc0543eBD9b9DD61222407d95Ce5eB9A32e3560";

const provider = new providers.JsonRpcProvider(RPC_HOST);
const elf = (new Contract(ELF_ADDRESS, elfAbi, provider) as any) as Elf;

export async function fetchContractName(): Promise<string> {
  const result = await elf.functions.name();
  return result[0];
}

export async function fetchBalance(): Promise<BigNumber> {
  const result = await elf.functions.balance();
  return result[0];
}

export async function fetchGovernance(): Promise<string> {
  const result = await elf.functions.governance();
  return result[0];
}

export async function fetchDecimals(): Promise<number> {
  const result = await elf.functions.decimals();
  return result[0];
}

export async function postDeposit(
  amount: BigNumberish,
  overrides?: Overrides
): Promise<ContractTransaction> {
  const result = await elf.functions.deposit(amount, overrides);
  return result;
}
