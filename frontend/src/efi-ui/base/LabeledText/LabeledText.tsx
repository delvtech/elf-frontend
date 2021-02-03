import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import React, { FC, ReactNode } from "react";

import tw from "efi-tailwindcss-classnames";

interface LabeledTextProps {
  /**
   * The main text the user needs to see
   */
  text: ReactNode;

  icon?: ReactNode;
  /**
   * A label to render alongside the text that's more subtle
   */
  label: ReactNode;

  large?: boolean;

  subLabel?: string;

  /**
   * Louder styling for the text
   */
  bold?: boolean;

  className?: string;

  iconClassName?: string;
  textClassName?: string;
}

export const LabeledText: FC<LabeledTextProps> = ({
  text,
  label,
  subLabel,
  bold = false,
  className,
  textClassName,
  iconClassName,
  icon,
  large,
}) => {
  return (
    <div className={tw("flex", "items-center")}>
      <div className={iconClassName}>{icon}</div>
      <div
        className={classNames(
          tw("flex", "flex-col", "justify-center", "space-y-1"),
          className
        )}
      >
        <span
          className={classNames(
            tw({ "font-semibold": bold, "text-lg": large }),
            textClassName
          )}
        >
          {text}
        </span>
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {label}
        </span>
        {!!subLabel && (
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};
