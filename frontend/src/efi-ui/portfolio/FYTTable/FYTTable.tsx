import React, { FC } from "react";

import { Classes, HTMLTable } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

import { FYTTableRow } from "./FYTTableRow";

interface FYTTableProps {}

const tableHeaders = [
  t`Maturity date`,
  t`Asset`,
  t`Quantity`,
  t`Current value`,
  t`Mint date`,
  t`Maturity`,
  t`Actions`,
];

export const FYTTable: FC<FYTTableProps> = () => {
  return (
    <HTMLTable striped className={tw("w-full")}>
      <thead>
        <tr className={Classes.TEXT_SMALL}>
          {tableHeaders.map((label) => (
            <th key={label}>
              <span className={classNames(tw("text-xs"), Classes.TEXT_MUTED)}>
                {label}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={Classes.TEXT_LARGE}>
        <FYTTableRow />
      </tbody>
    </HTMLTable>
  );
};
