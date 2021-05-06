import React, { ReactElement } from "react";

import { formatDuration, intervalToDuration, format } from "date-fns";
import { t } from "ttag";
import { Classes, Intent, ProgressBar, Tag } from "@blueprintjs/core";
import classNames from "classnames";

import { calculateProgress } from "efi/base/calculateProgress";

import tw from "efi-tailwindcss-classnames";

interface TimeLeftProps {
  /**
   * unix time in ms
   */
  startDate: number | undefined;
  /**
   * unix time in ms
   */
  maturityDate: number | undefined;
}

export function TimeLeft(props: TimeLeftProps): ReactElement {
  const { startDate = 0, maturityDate = 0 } = props;
  const progress = calculateProgress(startDate, maturityDate);
  const timeLeft = getTimeLeft(maturityDate);

  if (!startDate || !maturityDate) {
    return <span>{t`loading`}</span>;
  }

  const isMatured = Date.now() > maturityDate;
  const intent = isMatured ? Intent.SUCCESS : Intent.PRIMARY;

  return (
    <div className={tw("h-full", "w-full", "space-y-2")}>
      {isMatured ? (
        <div>
          <Tag intent={Intent.SUCCESS} className={tw("mr-4", "flex-grow-0")}>
            Matured
          </Tag>
        </div>
      ) : (
        <Tag intent={Intent.PRIMARY} className={tw("mr-4", "flex-grow-0")}>
          Running
        </Tag>
      )}
      {!isMatured ? (
        <ProgressBar
          intent={intent}
          animate={false}
          stripes={false}
          value={progress}
        />
      ) : null}
      <div
        className={classNames(Classes.TEXT_MUTED, tw("text-sm", "truncate"))}
      >
        {format(maturityDate, "MMM d, y")}
      </div>
      <div
        className={classNames(Classes.TEXT_MUTED, tw("text-sm", "truncate"))}
      >
        {timeLeft}
      </div>
    </div>
  );
}

function getTimeLeft(end: number): string {
  const now = Date.now();

  const duration = intervalToDuration({
    start: now,
    end: end,
  });
  const { years, months, weeks } = duration;

  const format =
    years || months || weeks
      ? ["years", "months", "days"]
      : ["days", "hours", "minutes"];

  const timeLeft = formatDuration(duration, {
    delimiter: ", ",
    format,
  });

  return timeLeft;
}
