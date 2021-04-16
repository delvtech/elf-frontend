import React, { ReactElement } from "react";
import { Intent, ProgressBar } from "@blueprintjs/core";
import tw from "efi-tailwindcss-classnames";

interface MaturityTimeBarLabelProps {
  progress: number;
  timeLeftLabel: ReactElement | null;
  isMature: boolean;
}

export function MaturityTimeBar({
  timeLeftLabel,
  progress,
  isMature,
}: MaturityTimeBarLabelProps): ReactElement {
  return (
    <div className={tw("w-full", "space-y-2", "flex", "flex-col")}>
      <div>{timeLeftLabel}</div>
      <ProgressBar
        intent={isMature ? Intent.SUCCESS : Intent.NONE}
        stripes={false}
        animate={false}
        value={progress}
      />
    </div>
  );
}
