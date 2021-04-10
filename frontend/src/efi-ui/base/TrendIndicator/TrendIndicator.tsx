import React, { ReactElement } from "react";

import { Icon, Intent, Tag } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";

import { formatPercent } from "efi/base/formatPercent";

interface TrendIndicatorProps {
  trend: number | undefined;
}
export function TrendIndicator({ trend }: TrendIndicatorProps): ReactElement {
  let intent: Intent;
  let icon: IconName;

  // cover zero and undefined case
  if (!trend) {
    intent = Intent.WARNING;
    icon = IconNames.MINUS;
  } else {
    intent = trend > 0 ? Intent.SUCCESS : Intent.DANGER;
    icon = trend > 0 ? IconNames.CARET_UP : IconNames.CARET_DOWN;
  }

  return (
    <Tag minimal intent={intent}>
      {formatPercent(trend || 0)}
      <Icon icon={icon} />
    </Tag>
  );
}
