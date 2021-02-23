import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { createQueryClient } from "efi/queryClient";
import { BPool__factory } from "elf-contracts/types/factories/BPool__factory";
import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

test("should render an empty list", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MarketsTable marketContracts={[]} />
  );

  return getByText("no markets found");
});

test("should render a list", () => {
  const queryClient = createQueryClient();
  const provider = jsonRpcProvider;
  const market = BPool__factory.connect(
    ContractAddresses.marketWethFYTAddress,
    provider
  );
  const { getByText } = renderWithClient(
    queryClient,
    <MarketsTable marketContracts={[market]} />
  );

  expect(getByText("Assets")).toBeVisible();
  expect(getByText("Total Liquidity")).toBeVisible();
  expect(getByText("Pool ROI")).toBeVisible();
  expect(getByText("Mint Date")).toBeVisible();
  expect(getByText("Tranche State")).toBeVisible();
});
