import { getTimeLeft } from "efi/base/time";
import React, { FC, useState } from "react";
import { useInterval } from "react-use";

import { t } from "ttag";

interface TimerProps {
  /**
   * end date in unix ms timestamp
   */
  endTime: number;
}

export const Timer: FC<TimerProps> = (props) => {
  const { endTime } = props;
  const [timerValue, setTimerValue] = useState(endTime - Date.now());
  useInterval(() => {
    setTimerValue(endTime - Date.now());
  }, 1000);
  const [daysLeft, hoursLeft, minutesLeft, secondsLeft] = getTimeLeft(
    timerValue
  );
  return (
    <span>
      {t`${daysLeft} days, ${hoursLeft}, hours, ${minutesLeft} minutes, ${secondsLeft} seconds`}
    </span>
  );
};
