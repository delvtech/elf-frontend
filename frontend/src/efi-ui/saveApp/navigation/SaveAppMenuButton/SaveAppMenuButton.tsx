import { ReactElement, useCallback, useState } from "react";

import { Icon, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ElementLogo } from "efi-ui/base/ElementLogo";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { AddressesJson } from "efi/addresses";
import { isGoerli, isMainnet } from "efi/ethereum";
import { SocialMediaMenuItems } from "efi/navigation/ContactUsMenuItems/SocialMediaMenuItems";

import styles from "./SaveAppMenuButton.module.css";
import classNames from "classnames";
import { MenuButton } from "efi-ui/base/MenuButton/MenuButton";
import { useSaveNavigation } from "efi-ui/saveApp/navigation/useSaveNavigation";
import { SaveNavigation } from "efi-ui/saveApp/navigation/SaveNavigation/SaveNavigation";

// assume testnet by default (goerli)
// assume testnet by default (goerli)
let earnAppUrl = "http://localhost:3000";
if (isGoerli(AddressesJson.chainId)) {
  earnAppUrl = "https://testnet.element.fi";
} else if (isMainnet(AddressesJson.chainId)) {
  earnAppUrl = "https://app.element.fi";
}

export function SaveAppMenuButton(): ReactElement {
  const { isDarkMode } = useDarkMode();

  return (
    <MenuButton
      menu={<SaveAppMenu />}
      buttonLabel={<ElementLogo iconOnly height={48} isDarkMode={isDarkMode} />}
    />
  );
}

function SaveAppMenu() {
  const { activeTab, changeTab } = useSaveNavigation();
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);

  const onResourcesMenuClose = useCallback(
    () => setIsResourcesMenuOpen(false),
    []
  );

  const onSaveClick = useCallback(
    () => changeTab(SaveNavigation.HOME),
    [changeTab]
  );
  const onPortfolioClick = useCallback(
    () => changeTab(SaveNavigation.PORTFOLIO),
    [changeTab]
  );
  const onResourcesClick = useCallback(
    () => setIsResourcesMenuOpen((isOpen) => !isOpen),
    []
  );

  if (isResourcesMenuOpen) {
    return <ResourcesMenu onClose={onResourcesMenuClose} />;
  }

  return (
    <Menu large>
      <MenuItem
        active={activeTab === SaveNavigation.HOME}
        labelElement={<Icon icon={IconNames.CHEVRON_RIGHT} />}
        onClick={onSaveClick}
        text={<span className={classNames(styles.menuItem)}>{t`Home`}</span>}
      />
      <MenuItem
        active={activeTab === SaveNavigation.PORTFOLIO}
        onClick={onPortfolioClick}
        labelElement={<Icon icon={IconNames.CHEVRON_RIGHT} />}
        text={
          <span className={classNames(styles.menuItem)}>{t`Portfolio`}</span>
        }
      />
      <MenuItem
        shouldDismissPopover={false}
        onClick={onResourcesClick}
        labelElement={<Icon icon={IconNames.CHEVRON_RIGHT} />}
        text={
          <span className={classNames(styles.menuItem)}>{t`Resources`}</span>
        }
      ></MenuItem>
    </Menu>
  );
}
interface ResourcesMenuProps {
  onClose: () => void;
}

function ResourcesMenu({ onClose }: ResourcesMenuProps) {
  return (
    <Menu large>
      <MenuItem
        shouldDismissPopover={false}
        icon={<Icon icon={IconNames.CHEVRON_LEFT} />}
        text={
          <span
            className={classNames(styles.menuItem, tw("font-bold"))}
          >{t`Resources`}</span>
        }
        onClick={onClose}
      />
      <MenuItem
        icon={<Icon icon={IconNames.BLANK} />}
        href="https://element.fi"
        target="_blank"
        rel="noreferrer"
        text={t`About`}
      />
      <MenuItem
        icon={<Icon icon={IconNames.BLANK} />}
        href="https://docs.element.fi"
        target="_blank"
        rel="noreferrer"
        text={t`Docs`}
      />
      {/* Don't open the simple UI in another tab, since going back and
    forth would just open up a ton of new tabs. */}
      <MenuItem
        icon={<Icon icon={IconNames.BLANK} />}
        href={earnAppUrl}
        text={t`Advanced UI`}
      />
      <MenuDivider
        title={<span className={tw("text-sm")}>{t`Get in touch`}</span>}
      />
      <SocialMediaMenuItems />
    </Menu>
  );
}
