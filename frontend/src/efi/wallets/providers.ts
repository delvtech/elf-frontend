import { ExternalProvider, Web3Provider } from "@ethersproject/providers";

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
