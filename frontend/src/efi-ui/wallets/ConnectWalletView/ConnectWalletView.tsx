import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import { MissingWalletEmptyState } from "efi-ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";

interface ConnectWalletViewProps extends RouteComponentProps {}
export const ConnectWalletView: FC<ConnectWalletViewProps> = () => {
  return (
    <div
      className={tw(
        "flex",
        "h-full",
        "w-full",
        "justify-center",
        "items-center"
      )}
    >
      <MissingWalletEmptyState />
    </div>
  );
};
