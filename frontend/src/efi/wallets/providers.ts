import { ExternalProvider, Web3Provider } from "@ethersproject/providers";

/**
 * The Web3 provider is a JSON RPC-based provider.
 */
export function getWeb3ProviderLibrary(provider?: ExternalProvider) {
  if (!provider) {
    console.log(
      `Could not instantiate web3 context at the root. Missing provider?`
    );
    return null;
  }

  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;

  return library;
}
