import { ReactElement } from "react";

import { Classes, Intent, ProgressBar, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { format } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { calculateProgress } from "efi/base/calculateProgress";
import { formatTimeLeft } from "efi/base/formatTImeLeft/formatTimeLeft";
import { formatTermLength } from "efi/tranche/formatTermLength/formatTermLength";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

interface TimeLeftProps {
  /**
   * unix time in ms
   */
  startTimestamp: number | undefined;
  /**
   * unix time in ms
   */
  maturityTimestamp: number | undefined;
}

export function TimeLeft2(props: TimeLeftProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { startTimestamp: startDate = 0, maturityTimestamp: maturityDate = 0 } =
    props;
  const progress = calculateProgress(startDate, maturityDate);

  const termLength = formatTermLength(startDate, maturityDate);
  const now = Date.now();
  const timeLeft = formatTimeLeft(now, maturityDate);
  const timeLeftLabel = t`${timeLeft} remaining`;

  if (!startDate || !maturityDate) {
    return <span>{t`loading`}</span>;
  }

  const isMature = now > maturityDate;

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
      <div className={tw("flex", "justify-between")}>
        <div className={classNames(tw("text-sm", "truncate"))}>
          {format(maturityDate, "MMM d, y")}
        </div>
        <Tag
          minimal={!isDarkMode}
          intent={isMature ? Intent.SUCCESS : Intent.PRIMARY}
          className={classNames(tw("truncate"))}
        >
          {termLength}
        </Tag>
      </div>
      <ProgressBar
        intent={isMature ? Intent.SUCCESS : Intent.PRIMARY}
        animate={false}
        stripes={false}
        value={progress}
      />
      <div
        className={classNames(Classes.TEXT_MUTED, tw("text-sm", "truncate"))}
      >
        {isMature ? t`Term complete` : timeLeftLabel}
      </div>
    </div>
  );
}
