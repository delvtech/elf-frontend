import React from "react";

import { renderWithClient } from "efi-ui/base/testing";
import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";
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

test("should render two tabs", async () => {
  const queryClient = createQueryClient();
  const { getByRole } = await renderWithClient(
    queryClient,
    <MarketActionsCard pool={elfPool} />
  );

  expect(getByRole("button", { name: "trade" })).toBeVisible();
  expect(getByRole("button", { name: "stake" })).toBeVisible();
});
