import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";
import { createQueryClient } from "efi/queryClient";

test("should render the pool view", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(queryClient, <PoolView />);

  expect(getByText("Pool Summary")).toBeVisible();
  expect(getByText("Yield Summary")).toBeVisible();
  expect(getByText("Tokens")).toBeVisible();
  expect(getByText("Pool Charts")).toBeVisible();
});
