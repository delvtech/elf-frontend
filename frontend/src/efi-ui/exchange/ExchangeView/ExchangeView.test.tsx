import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { ExchangeView } from "efi-ui/exchange/ExchangeView/ExchangeView";
import { createQueryClient } from "efi/queryClient";

test("should render with a title", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(queryClient, <ExchangeView />);

  expect(getByText("Element Exchange")).toBeVisible();
});
