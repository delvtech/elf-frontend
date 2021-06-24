import { ReactElement } from "react";

import classNames from "classnames";
import { formatDistance, formatDuration, intervalToDuration } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getIsMature2 } from "efi/tranche/getIsMature";

interface TimeLeftLabelProps {
  maturationDate: Date | undefined;
}

export function TimeLeftLabel(props: TimeLeftLabelProps): ReactElement | null {
  const { maturationDate } = props;
  if (!maturationDate) {
    return null;
  }

  const isMature = getIsMature2(maturationDate.getTime());
  if (isMature) {
    const timeSinceMaturity = getTimeSinceMaturityLabel(maturationDate);
    return (
      <span className={classNames(tw("text-base"))}>
        {t`Term reached `}
        <strong>{timeSinceMaturity}</strong>
      </span>
    );
  }

  const timeLeft = getTimeLeft(maturationDate);
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

function getTimeLeft(maturationDate: Date): string {
  const now = Date.now();

  const duration = intervalToDuration({
    start: now,
    end: maturationDate.getTime(),
  });

  const timeLeft = t`${formatDuration(duration, {
    delimiter: ", ",
    format: ["years", "months", "days"],
  })}`;

  return timeLeft;
}
