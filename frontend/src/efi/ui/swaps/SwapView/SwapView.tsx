import { Button, Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";

interface SwapViewProps {}
export const SwapView: FC<SwapViewProps> = () => {
  return (
    <div
      className={tw(
        "flex",
        "h-full",
        "w-full",
        "md:justify-center",
        "md:items-center"
      )}
    >
      {
        <NonIdealState
          icon={IconNames.SEND_TO_GRAPH}
          title="No wallet connected."
          description={
            <div
              className={classNames(
                tw("md:text-left", "flex", "flex-col", "gap-y-5")
              )}
            >
              <span>
                Connecting your wallet lets Element.fi do a few things:
              </span>
              <ol>
                <li>View and display your balances</li>
                <li>Initialize transactions on your behalf</li>
              </ol>
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
      }
    </div>
  );
};
