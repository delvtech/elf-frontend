import React, { FC } from "react";

import { Classes, HTMLTable } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

import { FYTTableRow } from "./FYTTableRow";

interface FYTTableProps {}

const tableHeaders = [
  t`Asset`,
  t`Quantity`,
  t`Current exit value`,
  t`Yield remaining`,
  t`Maturation date`,
  t`Actions`,
];

export const FYTTable: FC<FYTTableProps> = () => {
  return (
    <HTMLTable striped className={tw("w-full")}>
      <thead>
        <tr>
          {tableHeaders.map((label) => (
            <th key={label}>
              <span className={classNames(tw("pl-2"), Classes.TEXT_MUTED)}>
                {label}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={Classes.TEXT_LARGE}>
        <FYTTableRow />
        <FYTTableRow />
      </tbody>
    </HTMLTable>
  );
};
