import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function getEthereumProviderLibrary(
  provider?: ExternalProvider
): Web3Provider | null {
  if (!provider) {
    console.warn(
      `Could not instantiate web3 context at the root. Missing provider?`
    );
    return null;
  }

  const library = new Web3Provider(
    (jsonRpcProvider as unknown) as ExternalProvider
  );
  library.pollingInterval = 8000;

  return library;
}
