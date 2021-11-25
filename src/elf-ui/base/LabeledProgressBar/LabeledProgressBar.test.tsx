import React from "react";

import { render } from "@testing-library/react";

import { LabeledProgressBar } from "elf-ui/base/LabeledProgressBar/LabeledProgressBar";

test("should render the label", () => {
  const label = "until the end of time";
  const { getByText } = render(
    <LabeledProgressBar progressValue={0} label={label} showProgress />
  );

  expect(getByText(label)).toBeVisible();
});
