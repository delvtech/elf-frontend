import React, { FC } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FYTTableRow } from "efi-ui/portfolio/FYTTable/FYTTableRow";
import { Tranche } from "elf-contracts/types";

interface FYTTableProps {
  account: string | null | undefined;
  tranches: Tranche[];
}

const tableHeaders = [
  t`Asset`,
  t`Quantity`,
  t`Current exit value`,
  t`Yield remaining`,
  t`Maturation date`,
  t`Quick actions`,
];

export const FYTTable: FC<FYTTableProps> = ({ tranches }) => {
  return (
    <div data-testid="fyt-table" className={tw("flex", "flex-col", "w-full")}>
      {/* Table header */}
      <div
        className={tw("grid", "grid-cols-6", "px-6", "pb-3", "mb-2", "w-full")}
      >
        {tableHeaders.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {/* Table row */}
      <FYTTableRow />
    </div>
  );
};
