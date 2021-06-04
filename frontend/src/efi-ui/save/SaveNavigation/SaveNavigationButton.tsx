import { ReactElement } from "react";

import { Button, Menu, MenuItem, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

export function SaveNavigationButton(): ReactElement {
  return (
    <Popover2
      fill
      position={Position.BOTTOM_RIGHT}
      minimal
      className={tw("flex")}
      content={
        <Menu>
          <MenuItem text={t`Save`} />
        </Menu>
      }
    >
      <Button fill minimal className={tw("px-6")} icon={IconNames.MENU} />
    </Popover2>
  );
}
