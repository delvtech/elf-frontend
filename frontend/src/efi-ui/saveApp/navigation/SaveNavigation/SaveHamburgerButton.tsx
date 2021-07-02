import { ReactElement } from "react";

import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Position,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { AddressesJson } from "efi/addresses";
import { isGoerli, isMainnet } from "efi/ethereum";
import { SocialMediaMenuItems } from "efi/navigation/ContactUsMenuItems/SocialMediaMenuItems";

// assume testnet by default (goerli)
let earnAppUrl = "http://localhost:3000";
if (isGoerli(AddressesJson.chainId)) {
  earnAppUrl = "https://testnet.element.fi";
} else if (isMainnet(AddressesJson.chainId)) {
  earnAppUrl = "https://app.element.fi";
}

export function SaveHamburgerButton(): ReactElement {
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
          {/* Don't open the advanced UI in another tab, since going back and
          forth would just open up a ton of new tabs. */}
          <MenuItem href={earnAppUrl} text={t`Advanced UI`} />
          <MenuDivider
            title={<span className={tw("text-sm")}>{t`Get in touch`}</span>}
          />
          <SocialMediaMenuItems />
        </Menu>
      }
    >
      <Button fill minimal className={tw("px-6")} icon={IconNames.MENU} />
    </Popover2>
  );
}
