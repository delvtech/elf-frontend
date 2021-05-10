import React, { FC } from "react";

import { Classes, H5 } from "@blueprintjs/core";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";

export enum WalletIconId {
  WALLET_CONNECT = "WALLET_CONNECT",
}

interface ConnectWalletButtonProps {
  fill?: boolean;
  iconClassName?: string;
  icon: JSX.Element;
  name: string;
  onClick: () => void;
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = (props) => {
  const { fill, iconClassName, icon, name, onClick } = props;
  // Blueprint wraps the body in a span tag.  Use <button/> with blueprint classnames so we can use flex styles.
  return (
    <button
      className={classNames(
        Classes.BUTTON,
        Classes.LARGE,
        Classes.MINIMAL,
        tw({ "w-40": !fill, "w-full": fill })
      )}
      onClick={onClick}
    >
      <div
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "h-full",
          "items-center",
          "justify-center"
        )}
      >
        <div className={classNames(iconClassName, tw("m-2"))}>{icon}</div>
        <div className={tw("flex", "w-full", "items-center", "justify-center")}>
          <H5>{name}</H5>
        </div>
      </div>
    </button>
  );
};
