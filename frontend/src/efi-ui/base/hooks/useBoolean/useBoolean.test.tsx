import { fireEvent, render } from "@testing-library/react";
import React, { FC } from "react";

import { useBoolean } from "efi-ui/base/hooks/useBoolean/useBoolean";

test("Default value is set correctly", () => {
  const SampleComponent: FC<{}> = () => {
    const { value } = useBoolean(true);
    return <div>{value.toString()}</div>;
  };

  const { getByText } = render(<SampleComponent />);
  const value = getByText(/true/);
  expect(value).toBeInTheDocument();
});

test("Value can be set true", () => {
  const SampleComponent: FC<{}> = () => {
    const { value, setTrue } = useBoolean();
    return <button onClick={setTrue}>{value.toString()}</button>;
  };

  const { getByText } = render(<SampleComponent />);
  const button = getByText(/false/);

  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  const buttonAfterClick = getByText(/true/);
  expect(buttonAfterClick).toBeInTheDocument();
});

test("Value can be set false", () => {
  const SampleComponent: FC<{}> = () => {
    const { value, setFalse } = useBoolean(true);
    return <button onClick={setFalse}>{value.toString()}</button>;
  };

  const { getByText } = render(<SampleComponent />);
  const button = getByText(/true/);

  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  const buttonAfterClick = getByText(/false/);
  expect(buttonAfterClick).toBeInTheDocument();
});
