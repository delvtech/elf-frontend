import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";
import { createQueryClient } from "efi/queryClient";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";

test("should render two tabs", async () => {
  const queryClient = createQueryClient();
  const { getByRole } = await renderWithClient(
    queryClient,
    <MarketActionsCard market={stubbedMarkets[0]} />
  );

  expect(getByRole("button", { name: "trade" })).toBeVisible();
  expect(getByRole("button", { name: "stake" })).toBeVisible();
});
