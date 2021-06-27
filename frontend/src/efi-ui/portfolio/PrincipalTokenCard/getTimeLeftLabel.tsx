import { ReactElement } from "react";

import classNames from "classnames";
import { formatDistance, formatDuration, intervalToDuration } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getIsMature } from "efi/tranche/getIsMature";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatTimeLeft } from "efi/base/formatTImeLeft/formatTimeLeft";

interface TimeLeftLabelProps {
  unlockTimestamp: number;
}

export function TimeLeftLabel(props: TimeLeftLabelProps): ReactElement | null {
  const { unlockTimestamp } = props;
  const unlockTimestampDate = convertEpochSecondsToDate(unlockTimestamp);

  const isMature = getIsMature(unlockTimestamp);

  if (isMature) {
    const timeSinceMaturity = getTimeSinceMaturityLabel(unlockTimestampDate);
    return (
      <span className={classNames(tw("text-base"))}>
        {t`Term reached `}
        <strong>{timeSinceMaturity}</strong>
      </span>
    );
  }

  const timeLeft = formatTimeLeft(Date.now(), unlockTimestampDate.getTime());
  return (
    <span className={tw("text-base")}>
      {t`Reaches term in`} <strong>{timeLeft}</strong>
    </span>
  );
}

function getTimeSinceMaturityLabel(maturationDate: Date): string {
  const now = Date.now();
  return formatDistance(maturationDate, now, { addSuffix: true });
}
