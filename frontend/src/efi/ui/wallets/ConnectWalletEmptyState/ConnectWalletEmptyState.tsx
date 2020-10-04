import { Button, Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";

export const ConnectWalletEmptyState: FC<{}> = () => {
  return (
    <NonIdealState
      icon={IconNames.SEND_TO_GRAPH}
      title="No wallet connected."
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
          <span>Connecting your wallet lets Element.fi do a few things:</span>
          <ul className={tw("w-9/12", "list-disc", "text-left")}>
            <li className={tw("mb-3")}>
              View and display your crypto balances
            </li>
            <li>Initialize Ethereum transactions on your behalf</li>
          </ul>
        </div>
      }
      action={
        <Button large minimal outlined>
          Connect your wallet
        </Button>
      }
    >
      <div className={tw("pt-32")}>
        <p className={tw("pb-4")}>
          Swaps are currently in{" "}
          <Tag minimal intent={Intent.WARNING}>
            BETA
          </Tag>
          .
        </p>
        <p>
          Read more about <a href="#">how Swaps work</a>.
        </p>
      </div>
    </NonIdealState>
  );
};
