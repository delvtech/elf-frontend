import React from "react";

import { renderWithClient } from "efi-ui/base/testing";
import { MarketView } from "efi-ui/markets/MarketView/MarketView";
import { createQueryClient } from "efi/queryClient";

test("should render the market view", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(queryClient, <MarketView />);

  expect(getByText("Element Market")).toBeVisible();
});
