import { Provider } from "@ethersproject/providers";
import { Elf__factory } from "elf-contracts/types/factories/Elf__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { Elf } from "elf-contracts/types";

export function getElfContract(
  address: string,
  signerOrProvider?: Signer | Provider
): Elf {
  const signer = signerOrProvider ?? jsonRpcProvider;
  return Elf__factory.connect(address, signer);
}
