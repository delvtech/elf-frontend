import { render } from "@testing-library/react";
import { renderHook, RenderHookOptions } from "@testing-library/react-hooks";
import React, { FC, ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export function renderWithClient(client: QueryClient, ui: ReactElement) {
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

export function renderHookWithClient<P, R>(
  client: QueryClient,
  hook: (props: P) => R,
  renderOptions?: Pick<RenderHookOptions<P>, "initialProps">
) {
  const QueryClientWrapper: FC<P> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return renderHook(hook, {
    wrapper: QueryClientWrapper,
    initialProps: renderOptions?.initialProps,
  });
}
