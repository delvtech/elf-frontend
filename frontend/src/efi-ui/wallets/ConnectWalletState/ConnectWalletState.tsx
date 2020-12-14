import React, { FC } from "react";

import { Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

const betaTag = (
  <Tag key="beta-tag" minimal intent={Intent.WARNING}>
    {t`BETA`}
  </Tag>
);

const howItWorksLink = (
  <a key="how-it-work" href="/">{t`how investing works`}</a>
);

export const ConnectWalletState: FC<{}> = () => {
  return (
    <NonIdealState
      icon={IconNames.SEND_TO_GRAPH}
      title={t`No wallet connected.`}
      className={tw("max-w-full")}
      description={
        <div
          className={classNames(
            tw(
              "md:text-left",
              "flex",
              "flex-col",
              "justify-center",
              "items-center",
              "gap-y-5"
            )
          )}
        >
          <span>{t`Connecting your wallet lets Element.fi do a few things:`}</span>
          <ul className={tw("w-9/12", "list-disc", "text-left")}>
            <li className={tw("mb-3")}>
              {t`View and display your crypto balances`}
            </li>
            <li>{t`Initialize Ethereum transactions on your behalf`}</li>
          </ul>
        </div>
      }
      action={<ConnectWalletButtons />}
    >
      <div className={tw("pt-32")}>
        <p className={tw("pb-4")}>{jt`Element is currently in ${betaTag}.`}</p>
        <p>{jt`Read more about ${howItWorksLink}.`}</p>
      </div>
    </NonIdealState>
  );
};
