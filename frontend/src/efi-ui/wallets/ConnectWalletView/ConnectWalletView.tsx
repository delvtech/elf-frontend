import React, { FC } from "react";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ConnectWalletState } from "efi-ui/wallets/ConnectWalletState/ConnectWalletState";

interface ConnectWalletViewProps extends RouteComponentProps {}
export const ConnectWalletView: FC<ConnectWalletViewProps> = () => {
  return (
    <div className={tw("flex", "flex-col", "p-12", "items-center")}>
      <Button
        icon={IconNames.CHEVRON_LEFT}
        minimal
        outlined
        onClick={() => window.history.back()}
      >{t`Go back`}</Button>
      <div
        className={tw(
          "flex",
          "h-full",
          "w-full",
          "justify-center",
          "items-center"
        )}
      >
        <ConnectWalletState />
      </div>
    </div>
  );
};
