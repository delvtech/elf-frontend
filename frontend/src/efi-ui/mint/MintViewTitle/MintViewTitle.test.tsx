import React from "react";

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { renderWithClient } from "efi-ui/base/testing";
import { MintViewTitle } from "efi-ui/mint/MintViewTitle/MintViewTitle";
import { createQueryClient } from "efi/queryClient";

test("should render normally", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <MintViewTitle
      account="0xdeadbeef"
      chainId={555}
      active={false}
      library={undefined}
      connector={undefined}
    />
  );

  expect(getByText("Mint Yield Tokens")).toBeVisible();
});

test("should render with option to connect wallet if no account is present", async () => {
  const queryClient = createQueryClient();
  const { getByText, getByRole } = await renderWithClient(
    queryClient,
    <MintViewTitle
      account={null}
      chainId={555}
      active={false}
      library={undefined}
      connector={undefined}
    />
  );
  expect(getByText("Mint Yield Tokens")).toBeVisible();

  const button = getByRole("button", { name: /Connect wallet to begin/i });

  userEvent.click(button);

  expect(screen.getByTestId("connect-wallet-dialog")).toBeVisible();
});
