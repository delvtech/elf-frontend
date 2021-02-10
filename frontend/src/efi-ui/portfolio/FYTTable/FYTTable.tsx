import React, { FC } from "react";

import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FYTTableRow } from "efi-ui/portfolio/FYTTable/FYTTableRow";

interface FYTTableProps {
  account: string | null | undefined;
}

const tableHeaders = [
  t`Asset`,
  t`Quantity`,
  t`Current exit value`,
  t`Yield remaining`,
  t`Maturation date`,
  t`Quick actions`,
];

export const FYTTable: FC<FYTTableProps> = () => {
  return (
    <div data-testid="fyt-table" className={tw("flex", "flex-col", "w-full")}>
      {/* Table header */}
      <div
        className={tw("grid", "grid-cols-6", "px-6", "pb-3", "mb-2", "w-full")}
      >
        {tableHeaders.map((label) => (
          <div key={label}>
            <span className={classNames(tw())}>{label}</span>
          </div>
        ))}
      </div>

      {/* Table row */}
      <FYTTableRow />
    </div>
  );
};
