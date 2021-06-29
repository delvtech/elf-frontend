import React, { ReactElement } from "react";

import { Classes, Intent, ProgressBar, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { format } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { calculateProgress } from "efi/base/calculateProgress";
import { formatTimeLeft } from "efi/base/formatTImeLeft/formatTimeLeft";

interface TimeLeftProps {
  /**
   * unix time in ms
   */
  startTimestamp: number | undefined;
  /**
   * unix time in ms
   */
  maturityTimestamp: number | undefined;

  showDate?: boolean;
}

export function TimeLeft(props: TimeLeftProps): ReactElement {
  const {
    startTimestamp: startDate = 0,
    maturityTimestamp: maturityDate = 0,
    showDate = true,
  } = props;
  const progress = calculateProgress(startDate, maturityDate);
  const timeLeft = formatTimeLeft(Date.now(), maturityDate);

  if (!startDate || !maturityDate) {
    return <span>{t`loading`}</span>;
  }

  const isMature = Date.now() > maturityDate;
  const intent = isMature ? Intent.SUCCESS : Intent.PRIMARY;

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "h-full",
        "w-full",
        "space-y-2",
        "flex-shrink-0"
      )}
    >
      <div>
        {isMature ? (
          <Tag intent={Intent.SUCCESS} className={tw("mr-4", "flex-grow-0")}>
            {t`Mature`}
          </Tag>
        ) : (
          <Tag intent={Intent.PRIMARY} className={tw("mr-4", "flex-grow-0")}>
            {t`Running`}
          </Tag>
        )}
      </div>
      {!isMature ? (
        <ProgressBar
          intent={intent}
          animate={false}
          stripes={false}
          value={progress}
        />
      ) : null}
      {showDate ? (
        <div
          className={classNames(Classes.TEXT_MUTED, tw("text-sm", "truncate"))}
        >
          {format(maturityDate, "MMM d, y")}
        </div>
      ) : null}
      <div
        className={classNames(Classes.TEXT_MUTED, tw("text-sm", "truncate"))}
      >
        {timeLeft}
      </div>
    </div>
  );
}
