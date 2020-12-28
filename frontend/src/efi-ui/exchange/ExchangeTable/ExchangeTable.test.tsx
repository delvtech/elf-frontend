import React from "react";

import { render } from "@testing-library/react";

import { ExchangeTable } from "efi-ui/exchange/ExchangeTable/ExchangeTable";
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
  const { getByText } = await render(<ExchangeTable markets={[]} />);

  return getByText("no markets found");
});
