import React, { FC } from "react";

import { H5 } from "@blueprintjs/core";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";

export enum WalletIconId {
  WALLET_CONNECT = "WALLET_CONNECT",
}

interface ConnectWalletButtonProps {
  iconClassName?: string;
  icon: JSX.Element;
  name: string;
  onClick: () => void;
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = (props) => {
  const { iconClassName, icon, name, onClick } = props;
  // Blueprint wraps the body in a span tag.  Use <button/> with blueprint classnames so we can use flex styles.
  return (
    <button
      className={classNames(
        "bp3-button",
        "bp3-button-large",
        "bp3-minimal",
        "bp3-outlined"
      )}
      onClick={onClick}
    >
      <div
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "items-center",
          "justify-center"
        )}
      >
        <div className={classNames(iconClassName, tw("m-2"))}>{icon}</div>
        <div className={tw("flex-1", "items-center", "justify-center")}>
          <H5>{name}</H5>
        </div>
      </div>
    </button>
  );
};
