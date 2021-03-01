import React, { FC } from "react";

import tw from "efi-tailwindcss-classnames";
import { Tranche } from "elf-contracts/types";
import { FYTCard } from "efi-ui/portfolio/FYTTable/FYTCard";

interface FYTTableProps {
  account: string | null | undefined;
  tranches: Tranche[];
}

export const FYTTable: FC<FYTTableProps> = ({ account, tranches }) => {
  return (
    <div data-testid="fyt-table" className={tw("flex", "flex-col", "w-full")}>
      {tranches.map((tranche) => (
        <FYTCard key={tranche.address} account={account} tranche={tranche} />
      ))}
    </div>
  );
};
