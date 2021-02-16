import React, { FC, useState } from "react";
import { useInterval } from "react-use";

import { t } from "ttag";

import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { getTimeLeft } from "efi/base/time";

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

export const TimeLeft: FC<TimeLeftProps> = (props) => {
  const { startDate = 0, maturityDate = 0 } = props;
  const progress = (Date.now() - startDate) / (maturityDate - startDate);
  const [timerValue, setTimerValue] = useState(maturityDate - Date.now());
  useInterval(() => {
    setTimerValue(maturityDate - Date.now());
  }, 1000);
  const [daysLeft, hoursLeft, minutesLeft] = getTimeLeft(timerValue);
  const time = t`${daysLeft} days, ${hoursLeft}, hours, ${minutesLeft} minutes`;

  if (!startDate || !maturityDate) {
    return <span>{t`loading`}</span>;
  }

  return <LabeledProgressBar progressValue={progress} helperText={time} />;
};
