import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";
import React, { FC } from "react";

interface LabeledTextProps {
  /**
   * The main text the user needs to see
   */
  text: string;

  /**
   * A label to render alongside the text that's more subtle
   */
  label: string;

  /**
   * Louder styling for the text
   */
  bold?: boolean;
}

export const LabeledText: FC<LabeledTextProps> = ({
  text,
  label,
  bold = false,
}) => {
  return (
    <div
      className={tw(
        "flex",
        "h-full",
        "flex-col",
        "w-full",
        "justify-center",
        "space-y-1"
      )}
    >
      <span className={tw({ "font-semibold": bold })}>{text}</span>
      <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
        {label}
      </span>
    </div>
  );
};
