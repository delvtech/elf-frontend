import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { PoolsView } from "efi-ui/exchange/PoolsView/PoolsView";
import { createQueryClient } from "efi/queryClient";

test("should render with a title", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(queryClient, <PoolsView />);

  expect(getByText("Element Pools")).toBeVisible();
});
