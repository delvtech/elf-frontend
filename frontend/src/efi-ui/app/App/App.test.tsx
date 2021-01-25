// Ok, so here's what your tests might look like

import React, { ReactNode } from "react";

import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from "@reach/router";
import { render } from "@testing-library/react";
import App from "efi-ui/app/App/App";
import { QueryClientProvider } from "react-query";
import { efiQueryClient } from "efi/queryClient";

function renderWithEFIProviders(
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

test("full app rendering/navigating", async () => {
  const {
    container,
    history: { navigate },
  } = renderWithEFIProviders(<App />);
  const appContainer = container;
  expect(appContainer.innerHTML).toMatch("Welcome to Element Finance");

  // with reach-router we don't need to simulate a click event, we can just transition
  // to the page using the navigate function returned from the history object.
  await navigate("/portfolio");
  expect(container.innerHTML).toMatch(
    "View your balances and interest earnings."
  );
  await navigate("/invest");
  expect(container.innerHTML).toMatch(
    "Buy and sell Fixed Yield Tokens and Yield Coupons."
  );
  await navigate("/exchange");
  expect(container.innerHTML).toMatch(
    "Provide liquidity for this market, or trade for what you want."
  );
  await navigate("/mint");
  expect(container.innerHTML).toMatch(
    "A concise description of Minting makes it clear to the user why FYTs and YCs are useful to them."
  );
});

test("landing on a bad page", () => {
  const { container } = renderWithEFIProviders(<App />, {
    route: "/something-that-does-not-match",
  });

  // TODO: add a test here for a genric 404 page.
  expect(container.innerHTML).toMatch("");
});
