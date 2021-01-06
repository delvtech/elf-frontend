import { render } from "@testing-library/react";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import React from "react";

test("should render the label", () => {
  const label = "until the end of time";
  const { getByText } = render(
    <LabeledProgressBar progressValue={0} label={label} />
  );

  expect(getByText(label)).toBeVisible();
});
