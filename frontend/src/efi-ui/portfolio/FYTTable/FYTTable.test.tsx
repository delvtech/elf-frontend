import React from "react";

import { render } from "@testing-library/react";

import { FYTTable } from "efi-ui/portfolio/FYTTable/FYTTable";

test("should render a table", () => {
  const { getByRole } = render(<FYTTable />);
  expect(getByRole("table")).toBeVisible();
});
