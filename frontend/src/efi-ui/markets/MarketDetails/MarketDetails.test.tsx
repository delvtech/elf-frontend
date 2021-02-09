import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";
import { MarketDetails } from "efi-ui/markets/MarketDetails/MarketDetails";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";
import { Market } from "efi/markets/Market";

const market: Market = stubbedMarkets[0];

test("should render information about the market", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketDetails market={market} />
  );

  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Volume (24hr)")).toBeVisible();
  expect(getByText("Fees (24hr)")).toBeVisible();
});
