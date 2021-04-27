import React, { ReactElement } from "react";

import { formatDistance, formatDuration, intervalToDuration } from "date-fns";
import { t } from "ttag";

import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";

interface TimeLeftProps {
  /**
   * unix time in ms
   */
  startDate: number | undefined;
  /**
   * unix time in ms
   */
  maturityDate: number | undefined;

  label?: string;
}

export function TimeLeft(props: TimeLeftProps): ReactElement {
  const { startDate = 0, maturityDate = 0, label } = props;
  const progress = (Date.now() - startDate) / (maturityDate - startDate);
  const timeLeft = getTimeLeft(maturityDate);
  const timeSince = getTimeSince(maturityDate);
  const time = progress > 1 ? timeSince : timeLeft;

  if (!startDate || !maturityDate) {
    return <span>{t`loading`}</span>;
  }

  return (
    <LabeledProgressBar
      label={label}
      progressValue={progress}
      helperText={time}
    />
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

function getTimeSince(end: number): string {
  const now = Date.now();
  return formatDistance(end, now, { addSuffix: true });
}
