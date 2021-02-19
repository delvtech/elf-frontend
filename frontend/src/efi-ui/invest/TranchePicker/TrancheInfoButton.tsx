import React, { FC } from "react";

import { Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TrancheInfo } from "efi-ui/invest/TranchePicker/TrancheInfo";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { timeFormat } from "d3-time-format";

interface TrancheInfoButtonProps extends TrancheInfo {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TrancheInfoButton: FC<TrancheInfoButtonProps> = ({
  apy,
  unlockTimestamp,
  name,
  onClick,
}) => {
  const { isDarkMode } = useDarkMode();
  const redeemableDate = formatUnlockTimestamp(unlockTimestamp);

  return (
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.OUTLINED,
        tw("w-full", "p-4", "justify-between")
      )}
    >
      <div
        className={tw(
          "flex",
          "justify-between",
          "items-center",
          "space-x-4",
          "flex-1"
        )}
      >
        <div className={tw("flex", "items-center", "space-x-4")}>
          <div
            className={classNames(
              tw(
                "flex",
                "flex-col",
                "space-y-2",
                "items-center",
                "justify-center"
              )
            )}
          >
            <span className={tw("text-lg", "text-center")}>{t`${apy}%`}</span>
            <Tag
              minimal
              style={{
                backgroundColor: isDarkMode ? Colors.COBALT3 : Colors.COBALT4,
                color: Colors.WHITE,
              }}
            >
              <div>{"Fixed APY"}</div>
            </Tag>
          </div>
          <LabeledText
            className={tw("text-lg")}
            text={name}
            label={t`Redeemable on ${redeemableDate}`}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};

function formatUnlockTimestamp(unlockTimestamp: BigNumber | undefined) {
  const unlockTimestampMS = +(unlockTimestamp?.toString() || 0) * 1000;
  const redeemableDate = new Date(unlockTimestampMS);
  return timeFormat("%B %d, %Y")(redeemableDate);
}
