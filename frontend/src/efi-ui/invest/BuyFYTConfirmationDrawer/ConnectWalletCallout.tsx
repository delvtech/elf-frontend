import React, { FC } from "react";
import { Callout } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

export const ConnectWalletCallout: FC<unknown> = () => {
  return (
    <Callout className={tw("p-4")}>
      <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
        <span className="h4">{t`Connect your wallet to continue`}</span>
        <ConnectWalletButtons />
      </div>
    </Callout>
  );
};
