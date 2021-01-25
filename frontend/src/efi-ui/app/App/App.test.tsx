// Ok, so here's what your tests might look like

import React from "react";

import App from "efi-ui/app/App/App";

import { renderWithAppProviders } from "efi-ui/app/renderWithAppProviders";

test("full app rendering/navigating", async () => {
  const {
    container,
    history: { navigate },
  } = renderWithAppProviders(<App />);
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
  const { container } = renderWithAppProviders(<App />, {
    route: "/something-that-does-not-match",
  });

  // TODO: add a test here for a genric 404 page.
  expect(container.innerHTML).toMatch("");
});
