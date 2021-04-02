import React from "react";

import { FYTTable } from "efi-ui/portfolio/PrincipalTokenTable/FYTTable";
import { renderWithClient } from "efi-ui/testing/renderWithClient";
import { createQueryClient } from "efi/queryClient";

test("should render a table", () => {
  const queryClient = createQueryClient();
  const { getByTestId } = renderWithClient(
    queryClient,
    <FYTTable library={undefined} tranches={[]} account={null} />
  );
  expect(getByTestId("fyt-table")).toBeVisible();
});
