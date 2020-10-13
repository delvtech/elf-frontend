import { Button, Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { FC, useCallback } from "react";
import tw from "tailwindcss-classnames";
import { jt, t } from "ttag";
import { injectedConnector } from "efi/wallets/connectors";
import { useWalletConnection } from "efi/ui/wallets/hooks/useWalletConnection";

const betaTag = (
  <Tag key="beta-tag" minimal intent={Intent.WARNING}>
    {t`BETA`}
  </Tag>
);

const howSwapsWorkLink = (
  <a key="how-swaps-work" href="/">{t`how Swaps work`}</a>
);

export const MissingWalletEmptyState: FC<{}> = () => {
  const { connect } = useWalletConnection();

  // TODO: Make our own modal w/ buttons for all the different wallet connectors
  const connectToMetaMask = useCallback(() => connect(injectedConnector), [
    connect,
  ]);

  return (
    <NonIdealState
      icon={IconNames.SEND_TO_GRAPH}
      title={t`No wallet connected.`}
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
      action={
        <Button large minimal outlined onClick={connectToMetaMask}>
          {t`Connect your wallet`}
        </Button>
      }
    >
      <div className={tw("pt-32")}>
        <p className={tw("pb-4")}>{jt`Swaps are currently in ${betaTag}.`}</p>
        <p>{jt`Read more about ${howSwapsWorkLink}.`}</p>
      </div>
    </NonIdealState>
  );
};
