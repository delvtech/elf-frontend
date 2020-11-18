import React, { FC } from "react";

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePref } from "efi/ui/prefs/usePref/usePref";

const SampleComponent: FC<{}> = () => {
  const { pref, setPref } = usePref("test-pref", "my default pref value");

  return (
    <button
      onClick={() => {
        setPref("my updated pref");
      }}
    >
      {pref}
    </button>
  );
};

test("Default value is provided on initial render", () => {
  const { getByText } = render(<SampleComponent />);
  const value = getByText(/my default pref value/);
  expect(value).toBeInTheDocument();
});

test("Updating the pref causes rerender correctly", async () => {
  const { getByText, findByText } = render(<SampleComponent />);

  // renders the default value
  const button = getByText(/my default pref value/);

  // then the user clicks to update their pref
  userEvent.click(button);

  // renders the new pref values
  const buttonAfterClick = await findByText(/my updated pref/);
  expect(buttonAfterClick).toBeInTheDocument();
});
