import { CSSProperties, Fragment, ReactElement } from "react";

import { MenuItem } from "@blueprintjs/core";
import { t } from "ttag";

import discordLogo from "efi-static-assets/logos/svg/DISCORD.svg";
import mediumLogo from "efi-static-assets/logos/svg/MEDIUM.svg";
import telegramLogo from "efi-static-assets/logos/svg/TELEGRAM.svg";
import twitterLogo from "efi-static-assets/logos/svg/TWITTER.svg";
import tw from "efi-tailwindcss-classnames";

const menuItemIconStyle: CSSProperties = {
  height: 32,
  width: 32,
};

export function SocialMediaMenuItems(): ReactElement {
  return (
    <Fragment>
      <MenuItem
        href="https://discord.gg/JpctS728r9"
        className={tw("items-center")}
        icon={<img src={discordLogo} alt="Discord" style={menuItemIconStyle} />}
        target="_blank"
        rel="noreferrer"
        text={t`Discord`}
      />
      <MenuItem
        href="https://twitter.com/element_fi"
        target="_blank"
        className={tw("items-center")}
        icon={<img src={twitterLogo} alt="Twitter" style={menuItemIconStyle} />}
        rel="noreferrer"
        text={t`Twitter`}
      />
      <MenuItem
        href="https://t.me/elementfinance"
        target="_blank"
        className={tw("items-center")}
        icon={
          <img src={telegramLogo} alt="Telegram" style={menuItemIconStyle} />
        }
        rel="noreferrer"
        text={t`Telegram`}
      />
      <MenuItem
        href="https://medium.com/element-finance"
        className={tw("items-center")}
        icon={<img src={mediumLogo} alt="Medium" style={menuItemIconStyle} />}
        target="_blank"
        rel="noreferrer"
        text={t`Medium`}
      />
    </Fragment>
  );
}
