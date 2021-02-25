import React from "react";

import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";

test("should render an empty list", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(queryClient, <MarketsTable />);

  return getByText("no markets found");
});

// TODO: use waffle to deploy some contracts
test.skip("should render a list", () => {
  const queryClient = createQueryClient();
  const { getByText } = renderWithClient(queryClient, <MarketsTable />);

  expect(getByText("Assets")).toBeVisible();
  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Pool ROI")).toBeVisible();
  expect(getByText("Mint Date")).toBeVisible();
  expect(getByText("Tranche State")).toBeVisible();
});
