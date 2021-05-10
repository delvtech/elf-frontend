import React, { ReactElement } from "react";

import { Intent, ProgressBar } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { TimeLeftLabel } from "efi-ui/portfolio/PrincipalTokenCard/getTimeLeftLabel";
import { getIsMature } from "efi/tranche/getIsMature";

interface MaturityTimeBarLabelProps {
  progress: number;
  maturationDate: Date | undefined;
}

export function MaturityTimeBar({
  progress,
  maturationDate,
}: MaturityTimeBarLabelProps): ReactElement {
  const isMature = getIsMature(maturationDate);
  return (
    <div className={tw("w-full", "space-y-2", "flex", "flex-col")}>
      <div>
        <TimeLeftLabel maturationDate={maturationDate} />
      </div>
      <ProgressBar
        intent={isMature ? Intent.SUCCESS : Intent.NONE}
        stripes={false}
        animate={false}
        value={progress}
      />
    </div>
  );
}
