import React, { ReactElement } from "react";

import { Icon, Intent, Tag } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";

import { formatPercent } from "efi/base/formatPercent";

interface TrendIndicatorProps {
  value: number | undefined;
}
export function TrendIndicator({ value }: TrendIndicatorProps): ReactElement {
  let intent: Intent;
  let icon: IconName;

  // if the value would be formatted to '0.00%', then format the
  const valueIsZero = value && value > -0.0005 && value < 0.0005;

  if (!value || valueIsZero || !Number.isFinite(value)) {
    intent = Intent.WARNING;
    icon = IconNames.SMALL_MINUS;
  } else {
    intent = value > 0 ? Intent.SUCCESS : Intent.DANGER;
    icon = value > 0 ? IconNames.CARET_UP : IconNames.CARET_DOWN;
  }

  return (
    <Tag minimal intent={intent}>
      {formatPercent(value || 0)}
      <Icon icon={icon} />
    </Tag>
  );
}
