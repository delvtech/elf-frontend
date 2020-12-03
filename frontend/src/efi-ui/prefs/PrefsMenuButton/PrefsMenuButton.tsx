import React, { FC, Fragment } from "react";

import { Button, Icon, Popover } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import tw from "efi-tailwindcss-classnames";
import { PrefsMenu } from "efi-ui/prefs/PrefsMenu/PrefsMenu";

interface PrefsMenuButtonProps {}
export const PrefsMenuButton: FC<PrefsMenuButtonProps> = () => {
  return (
    <Fragment>
      {/* Mobile */}
      <Popover content={<PrefsMenu />}>
        <Button
          outlined
          minimal
          icon={<Icon icon={IconNames.SETTINGS} iconSize={14} />}
          className={tw("lg:hidden")}
        />
      </Popover>

      {/* Desktop */}
      <Popover content={<PrefsMenu />}>
        <Button
          outlined
          minimal
          large
          icon={IconNames.SETTINGS}
          className={tw("hidden", "lg:flex")}
        />
      </Popover>
    </Fragment>
  );
};
