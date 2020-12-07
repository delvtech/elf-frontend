import { Classes, Icon, Position, Tooltip } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { FC } from "react";
import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/base/FormGroupLabel/FormGroupLabel.module.css";
interface FormGroupLabelProps {
  label: string;
  tooltipContent?: string | JSX.Element;
}

export const FormGroupLabel: FC<FormGroupLabelProps> = ({
  label,
  tooltipContent,
}) => (
  <div
    className={classNames(
      tw("flex", "justify-between", "items-center", "text-base"),
      Classes.TEXT_MUTED
    )}
  >
    <span
      className={classNames(
        tw("text-base"),
        Classes.TEXT_MUTED,
        styles.tooltipLabel
      )}
    >
      {label}
    </span>

    {tooltipContent && (
      <Tooltip
        className={styles.tooltip}
        inheritDarkTheme={false}
        position={Position.TOP}
        content={tooltipContent}
      >
        <Icon icon={IconNames.INFO_SIGN} />
      </Tooltip>
    )}
  </div>
);
