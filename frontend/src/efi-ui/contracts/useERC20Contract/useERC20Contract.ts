import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";

import { getERC20Contract } from "efi/contracts/getERC20Contract";

/**
 * Returns a new instance of the ERC20 contract if an address is supplied.  This should only be used
 * for contracts that act as basic ERC20 tokens as no extra methods will be available.
 * @param { string | undefined } address the ERC20 contract address.
 * @param { Signer | Provider } signerOrProvider optionally pass a signer if transactions need to be
 * signed. A default provider is supplied to allow read operations.
 * @returns { ERC20 | undefined }
 */
export function useERC20Contract(
  address: string | undefined,
  signerOrProvider?: Signer | Provider
): ERC20 | undefined {
  const erc20Contract = useMemo(() => {
    if (!address) {
      return;
    }
    return getERC20Contract(address, signerOrProvider);
  }, [address, signerOrProvider]);

  return erc20Contract;
}
