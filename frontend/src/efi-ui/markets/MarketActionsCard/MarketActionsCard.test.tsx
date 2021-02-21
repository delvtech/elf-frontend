import React from "react";

import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";
import { renderWithClient } from "efi-ui/testing/renderWithClient";
import ContractAddresses from "efi/contracts/contractsJson";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";
import { createQueryClient } from "efi/queryClient";

test.only("should render two tabs", async () => {
  const queryClient = createQueryClient();
  const { getByRole } = await renderWithClient(
    queryClient,
    <MarketActionsCard
      signer={undefined}
      accountAddress={ContractAddresses.userAddress}
      market={stubbedMarkets[0]}
      marketContract={undefined}
    />
  );

  expect(getByRole("button", { name: "trade" })).toBeVisible();
  expect(getByRole("button", { name: "stake" })).toBeVisible();
});
