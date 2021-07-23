import { Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { formatTermLength } from "efi/tranche/formatTermLength/formatTermLength";
import { ReactElement } from "react";

interface TermTagProps {
  createdAtTimestamp: number;
  unlockTimestamp: number;
}
export function TermTag({
  createdAtTimestamp,
  unlockTimestamp,
}: TermTagProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const termLength = formatTermLength(
    createdAtTimestamp * 1000,
    unlockTimestamp * 1000
  );
  const now = Date.now();
  const isMature = now > unlockTimestamp * 1000;

  return (
    <Tag
      minimal={!isDarkMode}
      intent={isMature ? Intent.SUCCESS : Intent.PRIMARY}
      className={classNames(tw("truncate"))}
    >
      {termLength}
    </Tag>
  );
}
