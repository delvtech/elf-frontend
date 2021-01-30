import React from "react";

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";

test("should render normally", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <ViewTitle
      account="0xdeadbeef"
      chainId={555}
      active={false}
      library={undefined}
      connector={undefined}
      title="sample title"
      subtitle="sample subtitle"
    />
  );

  expect(getByText("sample title")).toBeVisible();
  expect(getByText("sample subtitle")).toBeVisible();
});

test("should render with option to connect wallet if no account is present", async () => {
  const queryClient = createQueryClient();
  const { getByRole } = await renderWithClient(
    queryClient,
    <ViewTitle
      account={null}
      chainId={555}
      active={false}
      library={undefined}
      connector={undefined}
      title="sample title"
      subtitle="sample subtitle"
    />
  );

  const button = getByRole("button", { name: /Connect wallet to begin/i });

  userEvent.click(button);

  expect(screen.getByTestId("connect-wallet-buttons")).toBeVisible();
});
