import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
/**
 * Returns a new instance of the ERC20 contract.  This should only be used for contracts that act as
 * basic ERC20 tokens as no extra methods will be available.
 * @param { string } address the contract address.
 * @param { Signer | Provider } signerOrProvider optionally pass a signer if transactions need to be
 * signed.  a default provider is supplied to allow read operations.
 */
export function useERC20Contract(
  address: string,
  signerOrProvider?: Signer | Provider
) {
  const signer = signerOrProvider ?? jsonRpcProvider;

  const erc20Contract = useMemo(() => getERC20Contract(address, signer), [
    address,
    signer,
  ]);

  return erc20Contract;
}

export function getERC20Contract(
  address: string,
  signerOrProvider: Signer | Provider
) {
  return ERC20__factory.connect(address, signerOrProvider);
}
