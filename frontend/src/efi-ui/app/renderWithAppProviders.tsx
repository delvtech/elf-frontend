import React, { ReactNode } from "react";
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from "@reach/router";
import { render } from "@testing-library/react";
import { QueryClientProvider } from "react-query";
import { efiQueryClient } from "efi/queryClient";

export function renderWithAppProviders(
  ui: ReactNode,
  { route = "/", history = createHistory(createMemorySource(route)) } = {}
) {
  return {
    ...render(
      <QueryClientProvider client={efiQueryClient}>
        <LocationProvider history={history}>{ui}</LocationProvider>
      </QueryClientProvider>
    ),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}
