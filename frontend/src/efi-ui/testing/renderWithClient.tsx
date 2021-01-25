import { render } from "@testing-library/react";
import React, { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export function renderWithClient(client: QueryClient, ui: ReactElement) {
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}
