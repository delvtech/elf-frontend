import { ReactElement, useCallback, useState } from "react";

import { Icon, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNavigation } from "efi-ui/app/navigation/hooks/useNavigation";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { ElementLogo } from "efi-ui/base/ElementLogo";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { AddressesJson } from "efi/addresses";
import { isGoerli, isLocalnet, isMainnet } from "efi/ethereum";
import { SocialMediaMenuItems } from "efi-ui/navigation/ContactUsMenuItems/SocialMediaMenuItems";

import styles from "./AppMenuButton.module.css";
import classNames from "classnames";
import { MenuButton } from "efi-ui/base/MenuButton/MenuButton";

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

export function AppMenuButton(): ReactElement {
  const { isDarkMode } = useDarkMode();

  return (
    <MenuButton
      menu={<AppMenu />}
      buttonLabel={<ElementLogo iconOnly height={48} isDarkMode={isDarkMode} />}
    />
  );
}

function AppMenu() {
  const { activeTab, changeTab } = useNavigation();
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);

  const onResourcesMenuClose = useCallback(
    () => setIsResourcesMenuOpen(false),
    []
  );

  const onEarnClick = useCallback(
    () => changeTab(Navigation.EARN),
    [changeTab]
  );
  const onTradeClick = useCallback(
    () => changeTab(Navigation.TRADE),
    [changeTab]
  );
  const onPortfolioClick = useCallback(
    () => changeTab(Navigation.PORTFOLIO),
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
        active={activeTab === Navigation.EARN}
        labelElement={<Icon icon={IconNames.CHEVRON_RIGHT} />}
        onClick={onEarnClick}
        text={<span className={classNames(styles.menuItem)}>{t`Earn`}</span>}
      />
      <MenuItem
        active={activeTab === Navigation.TRADE}
        onClick={onTradeClick}
        labelElement={<Icon icon={IconNames.CHEVRON_RIGHT} />}
        text={<span className={classNames(styles.menuItem)}>{t`Trade`}</span>}
      />
      <MenuItem
        active={activeTab === Navigation.PORTFOLIO}
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
        href={advancedLink}
        text={t`Save UI`}
      />
      <MenuDivider
        title={<span className={tw("text-sm")}>{t`Get in touch`}</span>}
      />
      <SocialMediaMenuItems />
    </Menu>
  );
}
