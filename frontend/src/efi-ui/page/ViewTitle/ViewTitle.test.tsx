import React from "react";

import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";

test("should render normally", async () => {
  const queryClient = createQueryClient();
  const { getByText } = await renderWithClient(
    queryClient,
    <ViewTitle title="sample title" subtitle="sample subtitle" />
  );

  expect(getByText("sample title")).toBeVisible();
  expect(getByText("sample subtitle")).toBeVisible();
});
