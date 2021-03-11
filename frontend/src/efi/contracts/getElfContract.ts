import { Provider } from "@ethersproject/providers";
import { Elf } from "elf-contracts/types/Elf";
import { Elf__factory } from "elf-contracts/types/factories/Elf__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function getElfContract(
  address: string,
  signerOrProvider?: Signer | Provider
): Elf {
  const signer = signerOrProvider ?? jsonRpcProvider;
  return Elf__factory.connect(address, signer);
}
