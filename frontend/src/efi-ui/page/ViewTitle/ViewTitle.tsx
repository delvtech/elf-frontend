import React, { FC, Fragment, ReactNode } from "react";

import { Classes, H2 } from "@blueprintjs/core";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";

interface ViewTitleProps {
  title: ReactNode;
  subtitle: ReactNode;
  /**
   * Whether or not to show the beta tag
   */
  titleTag?: ReactNode;
}

const subtitleClassName = classNames(
  Classes.RUNNING_TEXT,
  Classes.TEXT_MUTED,
  tw("text-base")
);

export const ViewTitle: FC<ViewTitleProps> = ({
  title,
  subtitle,
  titleTag,
}) => {
  return (
    <div className={tw("flex", "justify-between", "w-full")}>
      <div className={tw("flex", "flex-col", "justify-start", "flex-1")}>
        <H2 className={tw("mb-4")}>
          {title}
          {!titleTag ? null : (
            <Fragment>
              {" "}
              <sup>{titleTag}</sup>
            </Fragment>
          )}
        </H2>

        <span className={subtitleClassName}>{subtitle}</span>
      </div>
    </div>
  );
};
