import React, { FC } from "react";

import { Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TrancheInfo } from "efi-ui/invest/TranchePicker/TrancheInfo";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { formatAbbreviatedDate } from "efi/base/dates";
import { convertUnlockTimestampToDate } from "efi/tranche/convertUnlockTimestampToDate";

interface TrancheInfoButtonProps extends TrancheInfo {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TrancheInfoButton: FC<TrancheInfoButtonProps> = ({
  apy,
  unlockTimestamp,
  name,
  symbol,
  vaultName,
  onClick,
}) => {
  const { isDarkMode } = useDarkMode();
  const unlockDate = convertUnlockTimestampToDate(unlockTimestamp);
  const redeemableDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

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
            large
            text={t`Earn yield until ${redeemableDate}`}
            label={t`${symbol} - ${name} - ${vaultName}`}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
