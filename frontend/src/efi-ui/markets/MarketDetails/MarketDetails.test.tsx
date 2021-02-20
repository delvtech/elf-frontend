import React from "react";

import { MarketDetails } from "efi-ui/markets/MarketDetails/MarketDetails";
import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";
import ContractAddresses from "efi/contracts/contractsJson";
import { MockProvider } from "ethereum-waffle";

// TODO: add a contract and to extensive testing once we have the fixtures and hardhat added to the
// repo
test("should render information about the market", async () => {
  const [elementSigner] = new MockProvider().getWallets();
  // const BPOOL_ADDRESS = "0x1234123412341234123412341234123412341234";
  // const marketContract = BPool__factory.connect(BPOOL_ADDRESS, elementSigner);

  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketDetails
      signer={elementSigner}
      accountAddress={ContractAddresses.userAddress}
      marketContract={undefined}
    />
  );

  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Volume (24hr)")).toBeVisible();
  expect(getByText("Fees (24hr)")).toBeVisible();
});
