import React from "react";

import { render } from "@testing-library/react";

import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { Pool } from "efi/pools/Pool";

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
  const { getByText } = await render(<MarketsTable markets={[]} />);

  return getByText("no markets found");
});

test("should render a list", () => {
  const { getByText } = render(<MarketsTable markets={MARKETS} />);

  expect(getByText("Pair")).toBeInTheDocument();
  expect(getByText("ROI")).toBeInTheDocument();
  expect(getByText("Price")).toBeInTheDocument();
  expect(getByText("Balance")).toBeInTheDocument();
});
