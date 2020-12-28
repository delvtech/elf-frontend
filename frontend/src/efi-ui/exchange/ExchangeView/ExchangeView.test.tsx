import React from "react";

import { render } from "@testing-library/react";
import { ExchangeView } from "efi-ui/exchange/ExchangeView/ExchangeView";

test("should render with a title", async () => {
  const { getByText } = await render(<ExchangeView />);

  return getByText("Element Exchange");
});
