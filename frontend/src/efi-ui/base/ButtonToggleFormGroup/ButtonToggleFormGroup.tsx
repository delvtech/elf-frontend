import { Button, FormGroup } from "@blueprintjs/core";
import React, { FC } from "react";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";

interface ButtonToggleFormGroupProps {
  label: string;
  tooltipContent: string | JSX.Element;
  buttons: ButtonToggleFormGroupButton[];
  selectedButtonId: string;

  onSelect: (buttonId: string) => void;
}
interface ButtonToggleFormGroupButton {
  id: string;
  text: string;
}

export const ButtonToggleFormGroup: FC<ButtonToggleFormGroupProps> = ({
  label,
  tooltipContent,
  buttons,
  selectedButtonId,
  onSelect,
}) => {
  return (
    <FormGroup
      className={tw("space-y-2")}
      contentClassName={tw("space-x-4")}
      label={<FormGroupLabel label={label} tooltipContent={tooltipContent} />}
    >
      {buttons.map(({ id, text }) => (
        <Button
          key={id}
          large
          outlined
          active={id === selectedButtonId}
          onClick={() => {
            onSelect(id);
          }}
        >
          {text}
        </Button>
      ))}
    </FormGroup>
  );
};
