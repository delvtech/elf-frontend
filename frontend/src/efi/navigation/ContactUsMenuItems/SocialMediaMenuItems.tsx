import { Fragment, ReactElement } from "react";

import { MenuItem } from "@blueprintjs/core";
import { t } from "ttag";

import discordLogo from "efi-static-assets/logos/svg/DISCORD.svg";
import mediumLogo from "efi-static-assets/logos/svg/MEDIUM.svg";
import telegramLogo from "efi-static-assets/logos/svg/TELEGRAM.svg";
import twitterLogo from "efi-static-assets/logos/svg/TWITTER.svg";
import tw from "efi-tailwindcss-classnames";

export function SocialMediaMenuItems(): ReactElement {
  return (
    <Fragment>
      <MenuItem
        href="https://discord.gg/JpctS728r9"
        className={tw("items-center")}
        icon={
          <img
            src={discordLogo}
            alt="Discord"
            style={{
              height: 30,
              width: 30,
            }}
          />
        }
        target="_blank"
        rel="noreferrer"
        text={t`Discord`}
      />
      <MenuItem
        href="https://twitter.com/element_fi"
        target="_blank"
        className={tw("items-center")}
        icon={
          <img
            src={twitterLogo}
            alt="Twitter"
            style={{
              height: 26,
              width: 26,
            }}
          />
        }
        rel="noreferrer"
        text={t`Twitter`}
      />
      <MenuItem
        href="https://t.me/elementfinance"
        target="_blank"
        className={tw("items-center")}
        icon={
          <img
            src={telegramLogo}
            alt="Telegram"
            style={{
              height: 26,
              width: 26,
            }}
          />
        }
        rel="noreferrer"
        text={t`Telegram`}
      />
      <MenuItem
        href="https://medium.com/element-finance"
        className={tw("items-center")}
        icon={
          <img
            src={mediumLogo}
            alt="Medium"
            style={{
              height: 26,
              width: 26,
            }}
          />
        }
        target="_blank"
        rel="noreferrer"
        text={t`Medium`}
      />
    </Fragment>
  );
}
