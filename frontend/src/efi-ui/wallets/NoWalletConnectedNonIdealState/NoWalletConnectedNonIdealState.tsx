import { ReactElement } from "react";

import { Callout } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

interface NonWalletConnectedNonIdealStateProps {
  title: string;
}

export function NoWalletConnectedNonIdealState({
  title,
}: NonWalletConnectedNonIdealStateProps): ReactElement {
  return (
    <div className={tw("space-y-6", "text-center")}>
      <span className={tw("text-base")}>{title}</span>
      <Callout>
        <ConnectWalletButtons />
      </Callout>
    </div>
  );
}
