import React from "react";

import { renderWithClient } from "efi-ui/base/testing";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { Pool } from "efi/pools/Pool";
import { createQueryClient } from "efi/queryClient";

const elfPool: Pool = {
  id: "0xDEADBEEF",
  name: "Elf Pool",
  description: "Elf Pool for exchanging FYTs",
  stakingAsset: "ETH",
  strategyAsset: "DAI",
  heldAssets: ["yDAI", "yETH"],
};

const MARKETS = [elfPool, elfPool, elfPool];

test("should render an empty list", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketsTable markets={[]} />
  );

  return getByText("no markets found");
});

test("should render a list", () => {
  const queryClient = createQueryClient();
  const { getByText } = renderWithClient(
    queryClient,
    <MarketsTable markets={MARKETS} />
  );

  expect(getByText("Pair")).toBeInTheDocument();
  expect(getByText("ROI")).toBeInTheDocument();
  expect(getByText("Price")).toBeInTheDocument();
  expect(getByText("Balance")).toBeInTheDocument();
});
