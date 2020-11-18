import React, { FC } from "react";

import { Button, Popover } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { PrefsMenu } from "efi/ui/prefs/PrefsMenu/PrefsMenu";

interface PrefsMenuButtonProps {}
export const PrefsMenuButton: FC<PrefsMenuButtonProps> = () => {
  return (
    <Popover content={<PrefsMenu />}>
      <Button outlined minimal large icon={IconNames.SETTINGS} />
    </Popover>
  );
};
