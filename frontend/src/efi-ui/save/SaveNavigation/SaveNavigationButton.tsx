import { ReactElement } from "react";

import { Button, Menu, MenuItem, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useLocation } from "@reach/router";

export function SaveNavigationButton(): ReactElement {
  const { origin } = useLocation();
  return (
    <Popover2
      fill
      position={Position.BOTTOM_RIGHT}
      minimal
      className={tw("flex")}
      content={
        <Menu large>
          <MenuItem
            href="https://element.fi"
            target="_blank"
            rel="noreferrer"
            text={t`About`}
          />
          <MenuItem
            href="https://docs.element.fi"
            target="_blank"
            rel="noreferrer"
            text={t`Docs`}
          />
          <MenuItem
            href={`${origin}`}
            target="_blank"
            rel="noreferrer"
            text={t`Advanced UI`}
          />
          <MenuItem
            href="https://discord.gg/JpctS728r9"
            target="_blank"
            rel="noreferrer"
            text={t`Discord`}
          />
        </Menu>
      }
    >
      <Button fill minimal className={tw("px-6")} icon={IconNames.MENU} />
    </Popover2>
  );
}
