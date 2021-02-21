import React from "react";

import { MarketDetails } from "efi-ui/markets/MarketDetails/MarketDetails";
import { renderWithClient } from "efi-ui/testing/renderWithClient";
import ContractAddresses from "efi/contracts/contractsJson";
import { createQueryClient } from "efi/queryClient";

// TODO: add a contract and to extensive testing once we have the fixtures and hardhat added to the
// repo
test("should render information about the market", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketDetails
      signer={undefined}
      accountAddress={ContractAddresses.userAddress}
      marketContract={undefined}
    />
  );

  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Volume (24hr)")).toBeVisible();
  expect(getByText("Fees (24hr)")).toBeVisible();
});
