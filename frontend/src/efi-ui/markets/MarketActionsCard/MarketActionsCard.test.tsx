import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";
import { createQueryClient } from "efi/queryClient";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";
import ContractAddresses from "efi/contracts/contractsJson";
import { MockProvider } from "ethereum-waffle";

test("should render two tabs", async () => {
  const [signer] = new MockProvider().getWallets();
  const queryClient = createQueryClient();
  const { getByRole } = await renderWithClient(
    queryClient,
    <MarketActionsCard
      signer={signer}
      accountAddress={ContractAddresses.userAddress}
      market={stubbedMarkets[0]}
      marketContract={undefined}
    />
  );

  expect(getByRole("button", { name: "trade" })).toBeVisible();
  expect(getByRole("button", { name: "stake" })).toBeVisible();
});
