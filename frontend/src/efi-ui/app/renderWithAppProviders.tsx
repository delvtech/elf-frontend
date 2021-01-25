import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from "@reach/router";
import { render } from "@testing-library/react";
import { Web3ReactProvider } from "@web3-react/core";

import { getEthereumProviderLibrary } from "efi/wallets/providers";

const defaultQueryClient = new QueryClient();

interface ProviderOptions {
  route: string;
  queryClient: QueryClient;
}

const defaultOptions: ProviderOptions = {
  route: "/",
  queryClient: defaultQueryClient,
};
export function renderWithAppProviders(
  // unit under test
  uut: ReactNode,
  options?: Partial<ProviderOptions>
) {
  const { route, queryClient } = { ...defaultOptions, ...options };
  const history = createHistory(createMemorySource(route));
  return {
    ...render(
      <Web3ReactProvider getLibrary={getEthereumProviderLibrary}>
        <QueryClientProvider client={queryClient}>
          <LocationProvider history={history}>{uut}</LocationProvider>
        </QueryClientProvider>
      </Web3ReactProvider>
    ),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}
