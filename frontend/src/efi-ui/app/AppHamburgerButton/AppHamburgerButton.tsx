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
import { isGoerli, isLocalnet, isMainnet } from "efi/ethereum";
import { SocialMediaMenuItems } from "efi-ui/navigation/ContactUsMenuItems/SocialMediaMenuItems";

// assume testnet by default (goerli)
let advancedLink = "https://save-testnet.element.fi";
if (isLocalnet(AddressesJson.chainId)) {
  // TODO: Get this from the env, but for now assume in dev that the Save UI is @ :3001
  advancedLink = "http://localhost:3001";
}
if (isGoerli(AddressesJson.chainId)) {
  advancedLink = "https://save-testnet.element.fi";
} else if (isMainnet(AddressesJson.chainId)) {
  advancedLink = "https://save.element.fi";
}

export function AppHamburgerButton(): ReactElement {
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
          {/* Don't open the simple UI in another tab, since going back and
          forth would just open up a ton of new tabs. */}
          <MenuItem href={advancedLink} text={t`Save UI`} />
          <MenuDivider
            title={<span className={tw("text-sm")}>{t`Get in touch`}</span>}
          />
          <SocialMediaMenuItems />
        </Menu>
      }
    >
      <Button
        fill
        minimal
        className={tw("px-6", "py-3")}
        icon={IconNames.MENU}
      />
    </Popover2>
  );
}
