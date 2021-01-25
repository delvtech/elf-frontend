import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  createHistory,
  createMemorySource,
  LocationProvider,
  History,
} from "@reach/router";
import { render, RenderResult } from "@testing-library/react";
import { Web3ReactProvider } from "@web3-react/core";

import { getEthereumProviderLibrary } from "efi/wallets/providers";

interface ProviderOptions {
  route: string;
  history: History;
  queryClient: QueryClient;
}

interface RenderResultWithProviderOptions extends RenderResult {
  history: History;
  queryClient: QueryClient;
}

export function renderWithAppProviders(
  ui: ReactNode,
  options: Partial<ProviderOptions> = {}
): RenderResultWithProviderOptions {
  const {
    route = "/",
    queryClient = new QueryClient(),
    history = createHistory(createMemorySource(route)),
  } = options;

  return {
    ...render(
      <Web3ReactProvider getLibrary={getEthereumProviderLibrary}>
        <QueryClientProvider client={queryClient}>
          <LocationProvider history={history}>{ui}</LocationProvider>
        </QueryClientProvider>
      </Web3ReactProvider>
    ),
    history,
    queryClient,
  };
}
