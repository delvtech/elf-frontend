import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";
import { createQueryClient } from "efi/queryClient";

test("should render an empty list", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketsTable marketContracts={[]} markets={[]} />
  );

  return getByText("no markets found");
});

test("should render a list", () => {
  const queryClient = createQueryClient();
  const { getByText } = renderWithClient(
    queryClient,
    <MarketsTable marketContracts={[]} markets={stubbedMarkets} />
  );

  expect(getByText("Assets")).toBeVisible();
  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Pool ROI")).toBeVisible();
  expect(getByText("Mint Date")).toBeVisible();
  expect(getByText("Tranche State")).toBeVisible();
});
