import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

export function getEthereumProviderLibrary(provider?: ExternalProvider) {
  if (!provider) {
    console.warn(
      `Could not instantiate web3 context at the root. Missing provider?`
    );
    return null;
  }

  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;

  return library;
}

export async function fetchEthBalance(
  library: Web3Provider,
  account: string
): Promise<BigNumber> {
  return library.getBalance(account);
}
