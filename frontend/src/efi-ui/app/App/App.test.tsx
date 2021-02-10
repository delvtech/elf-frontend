// Ok, so here's what your tests might look like

import React from "react";

import App from "efi-ui/app/App/App";

import { renderWithAppProviders } from "efi-ui/testing/renderWithAppProviders";

test.skip("full app rendering/navigating", async () => {
  const {
    container,
    getByTestId,
    history: { navigate },
  } = renderWithAppProviders(<App />);
  const appContainer = container;
  expect(appContainer.innerHTML).toMatch("Welcome to Element Finance");

  // with reach-router we don't need to simulate a click event, we can just transition
  // to the page using the navigate function returned from the history object.
  await navigate("/portfolio");
  expect(getByTestId("portfolio-view")).toBeVisible();

  await navigate("/invest");
  expect(getByTestId("invest-view")).toBeVisible();

  await navigate("/exchange");
  expect(getByTestId("exchange-view")).toBeVisible();

  await navigate("/mint");
  expect(getByTestId("mint-view")).toBeVisible();
});

test.skip("landing on a bad page", () => {
  const { container } = renderWithAppProviders(<App />, {
    route: "/something-that-does-not-match",
  });

  // TODO: add a test here for a genric 404 page.
  expect(container.innerHTML).toMatch("");
});
