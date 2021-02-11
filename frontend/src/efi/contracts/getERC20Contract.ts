import { Provider } from "@ethersproject/providers";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Signer } from "ethers";

// TODO: Refactor to this to manage a cache of contract instances, ie:
// instantiate if it exists, otherwise return the cached instance.
export function getERC20Contract(
  address: string,
  signerOrProvider: Signer | Provider
) {
  const signer = signerOrProvider ?? jsonRpcProvider;
  return ERC20__factory.connect(address, signer);
}
