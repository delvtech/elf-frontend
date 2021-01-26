import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { MarketView } from "efi-ui/markets/MarketView/MarketView";
import { createQueryClient } from "efi/queryClient";

test("should render the market view", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(queryClient, <MarketView />);

  expect(getByText("Market Summary")).toBeVisible();
  expect(getByText("Yield Summary")).toBeVisible();
  expect(getByText("Tokens")).toBeVisible();
  expect(getByText("Market Charts")).toBeVisible();
});
