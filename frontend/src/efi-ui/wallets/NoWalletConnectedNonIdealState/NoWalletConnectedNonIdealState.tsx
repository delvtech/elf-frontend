import React, { FC, Fragment, useState } from "react";
import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";

interface NonWalletConnectedNonIdealStateProps {}

export const NoWalletConnectedNonIdealState: FC<NonWalletConnectedNonIdealStateProps> = () => {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const description = (
    <div
      className={tw(
        "md:text-left",
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "gap-y-5"
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
  );

  return (
    <Fragment>
      <NonIdealState
        icon={IconNames.SEND_TO_GRAPH}
        title={t`No wallet connected`}
        description={description}
        action={
          <Button
            outlined
            large
            onClick={() => setWalletDialogOpen(true)}
          >{t`Connect wallet to begin`}</Button>
        }
      />
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </Fragment>
  );
};
