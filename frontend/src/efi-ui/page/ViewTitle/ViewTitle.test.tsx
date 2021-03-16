import React from "react";

import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";

test("should render normally", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <ViewTitle title="sample title" subtitle="sample subtitle" />
  );

  expect(getByText("sample title")).toBeVisible();
  expect(getByText("sample subtitle")).toBeVisible();
});
