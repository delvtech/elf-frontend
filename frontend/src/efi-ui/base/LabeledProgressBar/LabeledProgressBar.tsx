import { Classes, Intent, ProgressBar } from "@blueprintjs/core";
import classNames from "classnames";
import React, { FC } from "react";
import tw from "efi-tailwindcss-classnames";

interface LabeledProgressBarProps {
  progressValue: number;
  label?: string;

  helperText?: string;
  intent?: Intent;
}
export const LabeledProgressBar: FC<LabeledProgressBarProps> = ({
  helperText,
  intent,
  label,
  progressValue,
}) => {
  return (
    <div
      className={tw(
        "flex",
        "h-full",
        "flex-col",
        "justify-center",
        "space-y-2"
      )}
    >
      <span>{label}</span>
      <ProgressBar
        intent={intent}
        animate={false}
        stripes={false}
        value={progressValue}
      />
      {!!helperText && (
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {helperText}
        </span>
      )}
    </div>
  );
};
