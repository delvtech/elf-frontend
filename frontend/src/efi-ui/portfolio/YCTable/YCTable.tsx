import React, { FC } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { YCTableRow } from "efi-ui/portfolio/YCTable/YCTableRow";

interface YCTableProps {
  account: string | null | undefined;
}

const tableHeaders = [
  t`Asset`,
  t`Quantity`,
  t`Current exit value`,
  t`Current acc. value`,
  t`Yield rate (YC)`,
  t`Yield rate (Underlying)`,
  t`Maturation date`,
  t`Quick actions`,
];

export const YCTable: FC<YCTableProps> = () => {
  return (
    <div data-testid="fyt-table" className={tw("flex", "flex-col", "w-full")}>
      {/* Table header */}
      <div
        className={tw("grid", "grid-cols-8", "px-6", "pb-3", "mb-2", "w-full")}
      >
        {tableHeaders.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {/* Table row */}
      <YCTableRow />
    </div>
  );
};
