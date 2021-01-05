import React from "react";

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { renderWithClient } from "efi-ui/base/testing";
import { PortfolioViewTitle } from "efi-ui/portfolio/PortfolioView/PortfolioViewTitle";
import { createQueryClient } from "efi/queryClient";

test("should render with the wallet address visible", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <PortfolioViewTitle account="0xdeadbeef" />
  );

  expect(getByText("Portfolio")).toBeVisible();
  expect(getByText(/0xdeadbeef/)).toBeVisible();
});

test("should render with option to connect wallet if no account is present", async () => {
  const queryClient = createQueryClient();
  const { getByText, getByRole } = await renderWithClient(
    queryClient,
    <PortfolioViewTitle account={null} />
  );

  expect(getByText("Portfolio")).toBeVisible();

  const button = getByRole("button");

  userEvent.click(button);

  expect(screen.getByTestId("connect-wallet-dialog")).toBeVisible();
});
