import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { Pool } from "efi/pools/Pool";
import { createQueryClient } from "efi/queryClient";
import { MarketDetailsCard } from "efi-ui/markets/MarketDetailsCard/MarketDetailsCard";

const elfPool: Pool = {
  id: "0xDEADBEEF",
  name: "Elf Pool",
  description: "Elf Pool for exchanging FYTs",
  stakingAsset: "ETH",
  strategyAsset: "DAI",
  heldAssets: ["yDAI", "yETH"],
};

test("should render information about the market", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketDetailsCard pool={elfPool} />
  );

  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Volume (24hr)")).toBeVisible();
  expect(getByText("Fees (24hr)")).toBeVisible();
});
